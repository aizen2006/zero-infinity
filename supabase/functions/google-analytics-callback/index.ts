import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const url = new URL(req.url)
    const code = url.searchParams.get('code')
    const state = url.searchParams.get('state') // This should be the user ID
    const error = url.searchParams.get('error')

    if (error) {
      console.error('OAuth error:', error)
      return new Response(
        `<html><body><script>window.close();</script><p>Authorization failed: ${error}</p></body></html>`,
        { headers: { 'Content-Type': 'text/html' } }
      )
    }

    if (!code || !state) {
      throw new Error('Missing authorization code or state')
    }

    // Exchange code for tokens
    const clientId = Deno.env.get('GOOGLE_CLIENT_ID')
    const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET')
    const redirectUri = `${Deno.env.get('SUPABASE_URL')}/functions/v1/google-analytics-callback`

    if (!clientId || !clientSecret) {
      throw new Error('Google OAuth credentials not configured')
    }

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    })

    const tokenData = await tokenResponse.json()

    if (!tokenResponse.ok) {
      throw new Error(`Token exchange failed: ${tokenData.error}`)
    }

    // Store tokens in database
    const { error: dbError } = await supabaseClient
      .from('integrations')
      .upsert({
        user_id: state,
        app_name: 'google-analytics',
        app_type: 'analytics',
        is_connected: true,
        oauth_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        token_expires_at: new Date(Date.now() + (tokenData.expires_in * 1000)).toISOString(),
        config: {
          scope: tokenData.scope,
        }
      })

    if (dbError) {
      throw new Error(`Database error: ${dbError.message}`)
    }

    console.log('Google Analytics integration successful for user:', state)

    // Return success page that closes the popup
    return new Response(
      `<html>
        <body>
          <script>
            // Send message to parent window
            window.opener?.postMessage({ type: 'GOOGLE_AUTH_SUCCESS' }, '*');
            window.close();
          </script>
          <div style="text-align: center; padding: 50px; font-family: Arial, sans-serif;">
            <h2>✅ Google Analytics Connected!</h2>
            <p>This window will close automatically...</p>
          </div>
        </body>
      </html>`,
      { headers: { 'Content-Type': 'text/html' } }
    )

  } catch (error) {
    console.error('Error in google-analytics-callback:', error)
    return new Response(
      `<html>
        <body>
          <script>
            window.opener?.postMessage({ type: 'GOOGLE_AUTH_ERROR', error: '${error.message}' }, '*');
            window.close();
          </script>
          <div style="text-align: center; padding: 50px; font-family: Arial, sans-serif;">
            <h2>❌ Connection Failed</h2>
            <p>Error: ${error.message}</p>
          </div>
        </body>
      </html>`,
      { headers: { 'Content-Type': 'text/html' } }
    )
  }
})