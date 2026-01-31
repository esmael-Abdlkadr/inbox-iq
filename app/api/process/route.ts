import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { classifyEmail } from '@/lib/ai/classifier';
import { extractEntities } from '@/lib/ai/extractor';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Verify user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { emailId, subject, emailBody, senderEmail, senderName } = body;

    if (!subject || !emailBody || !senderEmail) {
      return NextResponse.json(
        { error: 'Missing required fields: subject, emailBody, senderEmail' },
        { status: 400 }
      );
    }

    // Run classification and extraction in parallel
    const [classification, entities] = await Promise.all([
      classifyEmail(subject, emailBody, senderEmail),
      extractEntities(subject, emailBody, senderEmail, senderName),
    ]);

    // If emailId is provided, update the existing email in the database
    if (emailId) {
      const { error: updateError } = await supabase
        .from('emails')
        .update({
          category: classification.category,
          confidence: classification.confidence,
          reasoning: classification.reasoning,
          entities,
          processed_at: new Date().toISOString(),
        })
        .eq('id', emailId)
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Error updating email:', updateError);
      }
    }

    return NextResponse.json({
      success: true,
      classification,
      entities,
    });
  } catch (error) {
    console.error('Processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process email' },
      { status: 500 }
    );
  }
}


