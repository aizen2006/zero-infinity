import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    const { action, service, apiKey, config } = await req.json()

    switch (action) {
      case 'store': {
        if (!service || !apiKey) {
          throw new Error('Service name and API key are required')
        }

        // Store the API key in user's integration config
        const { error } = await supabaseClient
          .from('integrations')
          .upsert({
            user_id: user.id,
            app_name: service,
            app_type: 'api',
            is_connected: true,
            oauth_token: apiKey, // Store API key here
            config: config || {}
          })

        if (error) throw error

        return new Response(
          JSON.stringify({ success: true, message: 'API key stored successfully' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        )
      }

      case 'get': {
        if (!service) {
          throw new Error('Service name is required')
        }

        const { data, error } = await supabaseClient
          .from('integrations')
          .select('oauth_token, config')
          .eq('user_id', user.id)
          .eq('app_name', service)
          .eq('is_connected', true)
          .single()

        if (error) throw error

        return new Response(
          JSON.stringify({ 
            success: true, 
            apiKey: data?.oauth_token,
            config: data?.config 
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        )
      }

      case 'list': {
        const { data, error } = await supabaseClient
          .from('integrations')
          .select('app_name, app_type, is_connected, created_at')
          .eq('user_id', user.id)
          .eq('is_connected', true)

        if (error) throw error

        return new Response(
          JSON.stringify({ success: true, integrations: data }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        )
      }

      case 'delete': {
        if (!service) {
          throw new Error('Service name is required')
        }

        const { error } = await supabaseClient
          .from('integrations')
          .update({ is_connected: false, oauth_token: null })
          .eq('user_id', user.id)
          .eq('app_name', service)

        if (error) throw error

        return new Response(
          JSON.stringify({ success: true, message: 'API key deleted successfully' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        )
      }

      default:
        throw new Error('Invalid action')
    }

  } catch (error) {
    console.error('Error in manage-api-keys:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})