import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createTelegramClient, verifyOTP } from '@/lib/telegram/client';
import { encryptSession, hashPhoneNumber } from '@/lib/telegram/encryption';
import { pendingAuths } from '../auth/route';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { code, syncDms = true, syncGroups = true, syncChannels = true } = await request.json();

    if (!code) {
      return NextResponse.json({ error: 'Verification code is required' }, { status: 400 });
    }

    const pendingAuth = pendingAuths.get(user.id);
    if (!pendingAuth) {
      return NextResponse.json(
        { error: 'No pending authentication. Please request OTP again.' },
        { status: 400 }
      );
    }

    const { phoneCodeHash, phone, clientSession } = pendingAuth;

    const client = await createTelegramClient(clientSession);
    await client.connect();

    const session = await verifyOTP(client, phone, code, phoneCodeHash);
    const encryptedSession = encryptSession(session, user.id);
    const phoneHash = hashPhoneNumber(phone);

    const { data: existingConnection } = await supabase
      .from('telegram_connections')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (existingConnection) {
      await supabase
        .from('telegram_connections')
        .update({
          encrypted_session: encryptedSession,
          phone_hash: phoneHash,
          sync_dms: syncDms,
          sync_groups: syncGroups,
          sync_channels: syncChannels,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);
    } else {
      await supabase
        .from('telegram_connections')
        .insert({
          user_id: user.id,
          encrypted_session: encryptedSession,
          phone_hash: phoneHash,
          sync_dms: syncDms,
          sync_groups: syncGroups,
          sync_channels: syncChannels,
        });
    }

    pendingAuths.delete(user.id);
    await client.disconnect();

    return NextResponse.json({
      success: true,
      message: 'Telegram connected successfully',
    });
  } catch (error) {
    console.error('Telegram verification error:', error);
    const message = error instanceof Error ? error.message : 'Failed to verify OTP';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

