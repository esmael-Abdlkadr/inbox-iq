import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getClientFromEncryptedSession, fetchRecentMessages, disconnectClient } from '@/lib/telegram/client';
import { classifyTelegramMessage } from '@/lib/ai/classifier';
import { extractEntities } from '@/lib/ai/extractor';

export const maxDuration = 60; // Allow up to 60 seconds for this route

export async function POST() {
  let client = null;
  
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: connection } = await supabase
      .from('telegram_connections')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!connection) {
      return NextResponse.json(
        { error: 'Telegram not connected. Please connect your account first.' },
        { status: 400 }
      );
    }

    console.log('Connecting to Telegram...');
    
    try {
      client = await getClientFromEncryptedSession(connection.encrypted_session, user.id);
    } catch (connectError) {
      console.error('Failed to connect to Telegram:', connectError);
      return NextResponse.json(
        { error: 'Failed to connect to Telegram. Please try again or reconnect your account.' },
        { status: 500 }
      );
    }

    console.log('Fetching messages...');
    
    let messages;
    try {
      messages = await fetchRecentMessages(client, {
        syncDms: connection.sync_dms,
        syncGroups: connection.sync_groups,
        syncChannels: connection.sync_channels,
        limit: 10, // Reduced limit to avoid timeouts
      });
    } catch (fetchError) {
      console.error('Failed to fetch messages:', fetchError);
      await disconnectClient(client);
      return NextResponse.json(
        { error: 'Failed to fetch messages. Please try again.' },
        { status: 500 }
      );
    }

    console.log(`Fetched ${messages.length} messages, processing...`);

    const results: Array<{
      telegram_msg_id: string;
      status: 'synced' | 'skipped' | 'error';
      reason?: string;
      id?: string;
      category?: string;
    }> = [];

    // Process messages sequentially to avoid overwhelming the AI API
    for (const msg of messages) {
      const messageId = `${msg.chatId}_${msg.id}`;

      const { data: existing } = await supabase
        .from('emails')
        .select('id')
        .eq('telegram_msg_id', messageId)
        .eq('user_id', user.id)
        .single();

      if (existing) {
        results.push({
          telegram_msg_id: messageId,
          status: 'skipped',
          reason: 'already exists',
        });
        continue;
      }

      try {
        const [classification, entities] = await Promise.all([
          classifyTelegramMessage(msg.text, msg.senderName, msg.chatName, msg.chatType),
          extractEntities(msg.chatName, msg.text, msg.senderUsername || msg.senderName, msg.senderName),
        ]);

        const { data: inserted, error: insertError } = await supabase
          .from('emails')
          .insert({
            user_id: user.id,
            source: 'telegram',
            telegram_msg_id: messageId,
            chat_type: msg.chatType,
            chat_name: msg.chatName,
            sender_email: msg.senderUsername ? `@${msg.senderUsername}` : msg.senderName,
            sender_name: msg.senderName,
            sender_username: msg.senderUsername,
            subject: `${msg.chatType.toUpperCase()}: ${msg.chatName}`,
            body: msg.text,
            category: classification.category,
            confidence: classification.confidence,
            reasoning: classification.reasoning,
            entities,
            processed_at: new Date().toISOString(),
            created_at: msg.date.toISOString(),
          })
          .select('id')
          .single();

        if (insertError) throw insertError;

        results.push({
          telegram_msg_id: messageId,
          status: 'synced',
          id: inserted?.id,
          category: classification.category,
        });
      } catch (error) {
        console.error(`Error processing message ${messageId}:`, error);
        results.push({
          telegram_msg_id: messageId,
          status: 'error',
          reason: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    await supabase
      .from('telegram_connections')
      .update({ last_sync: new Date().toISOString() })
      .eq('user_id', user.id);

    await disconnectClient(client);

    const synced = results.filter(r => r.status === 'synced').length;
    const skipped = results.filter(r => r.status === 'skipped').length;
    const errors = results.filter(r => r.status === 'error').length;

    return NextResponse.json({
      success: true,
      total: messages.length,
      synced,
      skipped,
      errors,
      results,
    });
  } catch (error) {
    console.error('Telegram sync error:', error);
    
    if (client) {
      await disconnectClient(client);
    }
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to sync messages' },
      { status: 500 }
    );
  }
}
