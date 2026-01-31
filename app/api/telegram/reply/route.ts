import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getClientFromEncryptedSession, disconnectClient } from '@/lib/telegram/client';

export async function POST(request: NextRequest) {
  let client = null;
  
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { messageId, replyText } = await request.json();

    if (!messageId || !replyText) {
      return NextResponse.json(
        { error: 'Message ID and reply text are required' },
        { status: 400 }
      );
    }

    // Get the message from database to find chat info
    const { data: message } = await supabase
      .from('emails')
      .select('*')
      .eq('id', messageId)
      .eq('user_id', user.id)
      .eq('source', 'telegram')
      .single();

    if (!message) {
      return NextResponse.json(
        { error: 'Message not found or not a Telegram message' },
        { status: 404 }
      );
    }

    // Get Telegram connection
    const { data: connection } = await supabase
      .from('telegram_connections')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!connection) {
      return NextResponse.json(
        { error: 'Telegram not connected' },
        { status: 400 }
      );
    }

    // Connect to Telegram
    client = await getClientFromEncryptedSession(connection.encrypted_session, user.id);

    // Parse the telegram_msg_id to get chat ID and message ID
    const [chatId, originalMsgId] = message.telegram_msg_id.split('_');

    // First, get dialogs to populate the entity cache
    // This is required by GramJS to resolve chat entities
    await client.getDialogs({ limit: 30 });

    // Now try to get the entity for this chat
    let entity;
    try {
      // Try to get entity by ID (could be user, chat, or channel)
      entity = await client.getEntity(chatId);
    } catch (entityError) {
      console.error('Could not get entity directly, trying as number:', entityError);
      try {
        // Try as a number (for user IDs)
        entity = await client.getEntity(parseInt(chatId));
      } catch (numError) {
        console.error('Could not get entity as number:', numError);
        // Last resort: try to find in dialogs
        const dialogs = await client.getDialogs({ limit: 50 });
        const dialog = dialogs.find(d => d.id?.toString() === chatId);
        if (dialog) {
          entity = dialog.inputEntity;
        } else {
          throw new Error('Could not find chat. Please sync messages again.');
        }
      }
    }

    // Send the reply
    await client.sendMessage(entity, {
      message: replyText,
      replyTo: parseInt(originalMsgId),
    });

    await disconnectClient(client);

    return NextResponse.json({
      success: true,
      message: 'Reply sent successfully',
    });
  } catch (error) {
    console.error('Telegram reply error:', error);
    
    if (client) {
      await disconnectClient(client);
    }
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send reply' },
      { status: 500 }
    );
  }
}
