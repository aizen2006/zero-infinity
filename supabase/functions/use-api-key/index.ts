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

    const { service, endpoint, method = 'GET', data: requestData, headers: additionalHeaders } = await req.json()

    if (!service || !endpoint) {
      throw new Error('Service and endpoint are required')
    }

    // Get the API key for the service
    const { data: integration, error: integrationError } = await supabaseClient
      .from('integrations')
      .select('oauth_token, config')
      .eq('user_id', user.id)
      .eq('app_name', service)
      .eq('is_connected', true)
      .single()

    if (integrationError || !integration?.oauth_token) {
      throw new Error(`No API key found for service: ${service}`)
    }

    // Prepare headers based on service type
    let apiHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...additionalHeaders
    }

    // Add authorization header based on service
    switch (service) {
      case 'openai':
        apiHeaders['Authorization'] = `Bearer ${integration.oauth_token}`
        break
      case 'stripe':
        apiHeaders['Authorization'] = `Bearer ${integration.oauth_token}`
        break
      case 'twitter':
        // Twitter uses OAuth 1.0a, more complex auth needed
        throw new Error('Twitter API requires OAuth 1.0a - use dedicated Twitter functions')
      default:
        // Default to Bearer token
        apiHeaders['Authorization'] = `Bearer ${integration.oauth_token}`
    }

    // Make the API call
    const response = await fetch(endpoint, {
      method,
      headers: apiHeaders,
      body: requestData ? JSON.stringify(requestData) : undefined
    })

    const responseData = await response.text()
    let parsedData

    try {
      parsedData = JSON.parse(responseData)
    } catch {
      parsedData = responseData
    }

    return new Response(
      JSON.stringify({
        success: response.ok,
        status: response.status,
        data: parsedData
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in use-api-key:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})