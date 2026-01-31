import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { error } = await supabase
      .from('telegram_connections')
      .delete()
      .eq('user_id', user.id);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: 'Telegram disconnected successfully',
    });
  } catch (error) {
    console.error('Telegram disconnect error:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect Telegram' },
      { status: 500 }
    );
  }
}

