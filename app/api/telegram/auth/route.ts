import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendOTP } from '@/lib/telegram/client';
import { hashPhoneNumber } from '@/lib/telegram/encryption';

const pendingAuths = new Map<string, { phoneCodeHash: string; phone: string; clientSession: string }>();

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { phone } = await request.json();

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    if (!process.env.TELEGRAM_API_ID || !process.env.TELEGRAM_API_HASH) {
      return NextResponse.json(
        { error: 'Telegram API credentials not configured' },
        { status: 500 }
      );
    }

    const { phoneCodeHash, client } = await sendOTP(phone);
    const clientSession = client.session.save() as unknown as string;

    const phoneHash = hashPhoneNumber(phone);
    pendingAuths.set(user.id, { phoneCodeHash, phone, clientSession });

    setTimeout(() => pendingAuths.delete(user.id), 5 * 60 * 1000);

    return NextResponse.json({
      success: true,
      message: 'OTP sent to your Telegram',
      phoneHash,
    });
  } catch (error) {
    console.error('Telegram auth error:', error);
    const message = error instanceof Error ? error.message : 'Failed to send OTP';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: connection } = await supabase
      .from('telegram_connections')
      .select('id, phone_hash, sync_dms, sync_groups, sync_channels, last_sync, connected_at')
      .eq('user_id', user.id)
      .single();

    return NextResponse.json({ connection });
  } catch (error) {
    console.error('Error fetching Telegram connection:', error);
    return NextResponse.json({ error: 'Failed to fetch connection status' }, { status: 500 });
  }
}

export { pendingAuths };

