import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  const appUrl = process.env.NEXT_PUBLIC_APP_URL!

  if (error) {
    return NextResponse.redirect(`${appUrl}/dashboard?google=cancelled`)
  }

  // Verify CSRF state
  const savedState = req.cookies.get('google_oauth_state')?.value
  if (!state || state !== savedState) {
    return NextResponse.redirect(`${appUrl}/dashboard?google=error`)
  }

  if (!code) {
    return NextResponse.redirect(`${appUrl}/dashboard?google=error`)
  }

  try {
    // Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${appUrl}/api/auth/google/callback`,
        grant_type: 'authorization_code',
      }),
    })

    if (!tokenRes.ok) {
      return NextResponse.redirect(`${appUrl}/dashboard?google=error`)
    }

    const tokens = await tokenRes.json()

    // Get authenticated user from Supabase session
    const supabase = createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.redirect(`${appUrl}/login`)
    }

    // Save tokens (upsert — reconnect updates existing row)
    await supabase.from('google_tokens').upsert(
      {
        user_id: user.id,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    )

    const response = NextResponse.redirect(`${appUrl}/dashboard?google=connected`)
    response.cookies.delete('google_oauth_state')
    return response
  } catch {
    return NextResponse.redirect(`${appUrl}/dashboard?google=error`)
  }
}
