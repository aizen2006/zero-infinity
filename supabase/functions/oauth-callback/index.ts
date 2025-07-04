import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TokenConfig {
  [key: string]: {
    tokenUrl: string;
    clientIdKey: string;
    clientSecretKey: string;
    additionalParams?: Record<string, string>;
  }
}

const tokenConfigs: TokenConfig = {
  'stripe': {
    tokenUrl: 'https://connect.stripe.com/oauth/token',
    clientIdKey: 'STRIPE_CLIENT_ID',
    clientSecretKey: 'STRIPE_CLIENT_SECRET'
  },
  'slack': {
    tokenUrl: 'https://slack.com/api/oauth.v2.access',
    clientIdKey: 'SLACK_CLIENT_ID',
    clientSecretKey: 'SLACK_CLIENT_SECRET'
  },
  'gmail': {
    tokenUrl: 'https://oauth2.googleapis.com/token',
    clientIdKey: 'GOOGLE_CLIENT_ID',
    clientSecretKey: 'GOOGLE_CLIENT_SECRET'
  },
  'google-sheets': {
    tokenUrl: 'https://oauth2.googleapis.com/token',
    clientIdKey: 'GOOGLE_CLIENT_ID',
    clientSecretKey: 'GOOGLE_CLIENT_SECRET'
  },
  'google-analytics': {
    tokenUrl: 'https://oauth2.googleapis.com/token',
    clientIdKey: 'GOOGLE_CLIENT_ID',
    clientSecretKey: 'GOOGLE_CLIENT_SECRET'
  },
  'github': {
    tokenUrl: 'https://github.com/login/oauth/access_token',
    clientIdKey: 'GITHUB_CLIENT_ID',
    clientSecretKey: 'GITHUB_CLIENT_SECRET'
  },
  'shopify': {
    tokenUrl: 'https://{{shop}}.myshopify.com/admin/oauth/access_token',
    clientIdKey: 'SHOPIFY_CLIENT_ID',
    clientSecretKey: 'SHOPIFY_CLIENT_SECRET'
  },
  'mailchimp': {
    tokenUrl: 'https://login.mailchimp.com/oauth2/token',
    clientIdKey: 'MAILCHIMP_CLIENT_ID',
    clientSecretKey: 'MAILCHIMP_CLIENT_SECRET'
  }
}

Deno.serve(async (req) => {
  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const url = new URL(req.url)
    const code = url.searchParams.get('code')
    const state = url.searchParams.get('state')
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

    // Parse state to get user ID and service
    const [userId, service] = state.split(':')
    if (!userId || !service) {
      throw new Error('Invalid state parameter')
    }

    const config = tokenConfigs[service]
    if (!config) {
      throw new Error(`Unsupported service: ${service}`)
    }

    // Get OAuth credentials
    const clientId = Deno.env.get(config.clientIdKey)
    const clientSecret = Deno.env.get(config.clientSecretKey)
    
    if (!clientId || !clientSecret) {
      throw new Error(`${service} OAuth credentials not configured`)
    }

    const redirectUri = `${Deno.env.get('SUPABASE_URL')}/functions/v1/oauth-callback`
    
    // Handle different token exchange formats
    let tokenResponse
    if (service === 'github') {
      // GitHub uses form data and expects Accept header
      tokenResponse = await fetch(config.tokenUrl, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          code: code,
        }),
      })
    } else if (service === 'slack') {
      // Slack has a different format
      tokenResponse = await fetch(config.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          code: code,
          redirect_uri: redirectUri,
        }),
      })
    } else {
      // Standard OAuth2 format
      tokenResponse = await fetch(config.tokenUrl, {
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
    }

    const tokenData = await tokenResponse.json()

    if (!tokenResponse.ok) {
      throw new Error(`Token exchange failed: ${tokenData.error || 'Unknown error'}`)
    }

    // Extract access token based on service
    let accessToken = tokenData.access_token
    let refreshToken = tokenData.refresh_token
    let expiresIn = tokenData.expires_in

    // Handle service-specific response formats
    if (service === 'slack' && tokenData.authed_user) {
      accessToken = tokenData.authed_user.access_token
    }

    // Store tokens in database
    const { error: dbError } = await supabaseClient
      .from('integrations')
      .upsert({
        user_id: userId,
        app_name: service,
        app_type: getAppType(service),
        is_connected: true,
        oauth_token: accessToken,
        refresh_token: refreshToken,
        token_expires_at: expiresIn ? new Date(Date.now() + (expiresIn * 1000)).toISOString() : null,
        config: {
          scope: tokenData.scope,
          service_data: tokenData
        }
      })

    if (dbError) {
      throw new Error(`Database error: ${dbError.message}`)
    }

    console.log(`${service} integration successful for user:`, userId)

    // Return success page that closes the popup
    return new Response(
      `<html>
        <body>
          <script>
            // Send message to parent window
            window.opener?.postMessage({ type: 'OAUTH_SUCCESS', service: '${service}' }, '*');
            window.close();
          </script>
          <div style="text-align: center; padding: 50px; font-family: Arial, sans-serif;">
            <h2>✅ ${service.charAt(0).toUpperCase() + service.slice(1)} Connected!</h2>
            <p>This window will close automatically...</p>
          </div>
        </body>
      </html>`,
      { headers: { 'Content-Type': 'text/html' } }
    )

  } catch (error) {
    console.error('Error in oauth-callback:', error)
    return new Response(
      `<html>
        <body>
          <script>
            window.opener?.postMessage({ type: 'OAUTH_ERROR', error: '${error.message}' }, '*');
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

function getAppType(service: string): string {
  const typeMap: Record<string, string> = {
    'stripe': 'payment',
    'slack': 'communication',
    'gmail': 'email',
    'google-sheets': 'productivity',
    'github': 'development',
    'shopify': 'ecommerce',
    'mailchimp': 'marketing',
    'google-analytics': 'analytics'
  }
  return typeMap[service] || 'other'
}