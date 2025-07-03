import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface OAuthConfig {
  [key: string]: {
    authUrl: string;
    clientIdKey: string;
    scopes: string;
    responseType?: string;
    additionalParams?: Record<string, string>;
  }
}

const oauthConfigs: OAuthConfig = {
  'stripe': {
    authUrl: 'https://connect.stripe.com/oauth/authorize',
    clientIdKey: 'STRIPE_CLIENT_ID',
    scopes: 'read_write',
    responseType: 'code'
  },
  'slack': {
    authUrl: 'https://slack.com/oauth/v2/authorize',
    clientIdKey: 'SLACK_CLIENT_ID',
    scopes: 'channels:read,chat:write,users:read',
    responseType: 'code'
  },
  'gmail': {
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    clientIdKey: 'GOOGLE_CLIENT_ID',
    scopes: 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send',
    responseType: 'code',
    additionalParams: {
      access_type: 'offline',
      prompt: 'consent'
    }
  },
  'google-sheets': {
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    clientIdKey: 'GOOGLE_CLIENT_ID',
    scopes: 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.readonly',
    responseType: 'code',
    additionalParams: {
      access_type: 'offline',
      prompt: 'consent'
    }
  },
  'github': {
    authUrl: 'https://github.com/login/oauth/authorize',
    clientIdKey: 'GITHUB_CLIENT_ID',
    scopes: 'user,repo,read:org',
    responseType: 'code'
  },
  'shopify': {
    authUrl: 'https://{{shop}}.myshopify.com/admin/oauth/authorize',
    clientIdKey: 'SHOPIFY_CLIENT_ID',
    scopes: 'read_products,read_orders,read_customers',
    responseType: 'code'
  },
  'mailchimp': {
    authUrl: 'https://login.mailchimp.com/oauth2/authorize',
    clientIdKey: 'MAILCHIMP_CLIENT_ID',
    scopes: 'r',
    responseType: 'code'
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Verify the user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      throw new Error('Invalid user token')
    }

    const { action, service, shopDomain } = await req.json()

    if (action === 'initiate') {
      const config = oauthConfigs[service]
      if (!config) {
        throw new Error(`Unsupported service: ${service}`)
      }

      const clientId = Deno.env.get(config.clientIdKey)
      console.log(`${service} Client ID exists:`, !!clientId)
      
      if (!clientId) {
        throw new Error(`${service} Client ID not configured`)
      }

      let authUrl = config.authUrl
      if (service === 'shopify' && shopDomain) {
        authUrl = authUrl.replace('{{shop}}', shopDomain)
      }

      const redirectUri = `${Deno.env.get('SUPABASE_URL')}/functions/v1/oauth-callback`
      const state = `${user.id}:${service}` // Include service in state for callback

      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        scope: config.scopes,
        response_type: config.responseType || 'code',
        state: state
      })

      // Add additional params if configured
      if (config.additionalParams) {
        Object.entries(config.additionalParams).forEach(([key, value]) => {
          params.append(key, value)
        })
      }

      const fullAuthUrl = `${authUrl}?${params.toString()}`

      return new Response(
        JSON.stringify({ authUrl: fullAuthUrl }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )

  } catch (error) {
    console.error('Error in oauth-auth:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})