import { NextRequest, NextResponse } from 'next/server';
import { getTokensFromCode } from '@/lib/gmail/client';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    if (error) {
      console.error('Gmail OAuth error:', error);
      return NextResponse.redirect(`${baseUrl}/settings?error=gmail_auth_failed`);
    }

    if (!code) {
      return NextResponse.redirect(`${baseUrl}/settings?error=no_code`);
    }

    // Exchange code for tokens
    const tokens = await getTokensFromCode(code);
    
    if (!tokens.access_token) {
      return NextResponse.redirect(`${baseUrl}/settings?error=no_access_token`);
    }

    const cookieStore = await cookies();
    
    cookieStore.set('gmail_access_token', tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60, // 1 hour
    });
    
    if (tokens.refresh_token) {
      cookieStore.set('gmail_refresh_token', tokens.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    }

    // Also pass tokens to client via URL (will be stored in localStorage)
    const redirectUrl = new URL(`${baseUrl}/settings`);
    redirectUrl.searchParams.set('gmail', 'connected');
    redirectUrl.searchParams.set('access_token', tokens.access_token);
    if (tokens.refresh_token) {
      redirectUrl.searchParams.set('refresh_token', tokens.refresh_token);
    }

    return NextResponse.redirect(redirectUrl.toString());
  } catch (error) {
    console.error('Error handling Gmail callback:', error);
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    return NextResponse.redirect(`${baseUrl}/settings?error=token_exchange_failed`);
  }
}
