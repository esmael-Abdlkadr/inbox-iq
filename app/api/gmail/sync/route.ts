import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { fetchRecentEmails } from '@/lib/gmail/client';
import { classifyEmail } from '@/lib/ai/classifier';
import { extractEntities } from '@/lib/ai/extractor';

interface SyncResult {
  gmail_id: string;
  status: 'synced' | 'skipped' | 'error';
  reason?: string;
  id?: string;
  category?: string;
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    let { accessToken, refreshToken } = body;
    const { maxResults = 10 } = body;

    if (!accessToken) {
      const cookieStore = await cookies();
      accessToken = cookieStore.get('gmail_access_token')?.value;
      refreshToken = refreshToken || cookieStore.get('gmail_refresh_token')?.value;
    }

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Gmail access token required. Please reconnect Gmail.' },
        { status: 400 }
      );
    }

    let emails;
    try {
      emails = await fetchRecentEmails(accessToken, refreshToken, maxResults);
    } catch (gmailError) {
      console.error('Gmail fetch error:', gmailError);
      return NextResponse.json(
        { error: 'Failed to fetch from Gmail. Token may be expired. Please reconnect.' },
        { status: 401 }
      );
    }
    
    const results: SyncResult[] = [];

    const batchSize = 3;
    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize);
      
      const batchResults = await Promise.all(
        batch.map(async (email): Promise<SyncResult> => {
          const { data: existing } = await supabase
            .from('emails')
            .select('id')
            .eq('gmail_id', email.gmail_id)
            .eq('user_id', user.id)
            .single();

          if (existing) {
            return { gmail_id: email.gmail_id, status: 'skipped', reason: 'already exists' };
          }

          try {
            const [classification, entities] = await Promise.all([
              classifyEmail(email.subject, email.body, email.sender_email),
              extractEntities(email.subject, email.body, email.sender_email, email.sender_name),
            ]);

            const { data: inserted, error } = await supabase
              .from('emails')
              .insert({
                user_id: user.id,
                gmail_id: email.gmail_id,
                sender_email: email.sender_email,
                sender_name: email.sender_name,
                subject: email.subject,
                body: email.body,
                category: classification.category,
                confidence: classification.confidence,
                reasoning: classification.reasoning,
                entities,
                processed_at: new Date().toISOString(),
                created_at: email.received_at,
              })
              .select()
              .single();

            if (error) {
              console.error('Error inserting email:', error);
              return { gmail_id: email.gmail_id, status: 'error', error: error.message };
            }
            
            return { 
              gmail_id: email.gmail_id, 
              status: 'synced', 
              id: inserted.id,
              category: classification.category 
            };
          } catch (aiError) {
            console.error('AI processing error:', aiError);
            return { gmail_id: email.gmail_id, status: 'error', error: 'AI processing failed' };
          }
        })
      );
      
      results.push(...batchResults);
    }

    const synced = results.filter(r => r.status === 'synced').length;
    const skipped = results.filter(r => r.status === 'skipped').length;
    const errors = results.filter(r => r.status === 'error').length;

    return NextResponse.json({
      success: true,
      total: emails.length,
      synced,
      skipped,
      errors,
      results,
    });
  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to sync emails' },
      { status: 500 }
    );
  }
}

