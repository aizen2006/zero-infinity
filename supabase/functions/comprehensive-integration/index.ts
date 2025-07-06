import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      throw new Error('Invalid user token')
    }

    const { platform, action, ...params } = await req.json();

    // Get integration details
    const { data: integration } = await supabaseClient
      .from('integrations')
      .select('*')
      .eq('user_id', user.id)
      .eq('app_name', platform)
      .eq('is_connected', true)
      .single();

    if (!integration) {
      throw new Error(`${platform} integration not found`);
    }

    const accessToken = integration.oauth_token;

    switch (platform) {
      case 'slack':
        return await handleSlackIntegration(accessToken, action, params);
      case 'microsoft-teams':
        return await handleTeamsIntegration(accessToken, action, params);
      case 'github':
        return await handleGitHubIntegration(accessToken, action, params);
      case 'shopify':
        return await handleShopifyIntegration(accessToken, action, params);
      case 'stripe':
        return await handleStripeIntegration(accessToken, action, params);
      case 'facebook-business':
        return await handleFacebookIntegration(accessToken, action, params);
      case 'linkedin-business':
        return await handleLinkedInIntegration(accessToken, action, params);
      default:
        throw new Error(`Platform ${platform} not supported`);
    }

  } catch (error) {
    console.error('Error in comprehensive-integration function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Slack Integration
async function handleSlackIntegration(accessToken: string, action: string, params: any) {
  const baseUrl = 'https://slack.com/api';
  
  switch (action) {
    case 'get_channels':
      const channelsResponse = await fetch(`${baseUrl}/conversations.list`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      const channelsData = await channelsResponse.json();
      return new Response(JSON.stringify({ channels: channelsData.channels }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    case 'get_messages':
      const messagesResponse = await fetch(`${baseUrl}/conversations.history?channel=${params.channelId}&limit=${params.limit || 50}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      const messagesData = await messagesResponse.json();
      return new Response(JSON.stringify({ messages: messagesData.messages }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    default:
      throw new Error(`Slack action ${action} not supported`);
  }
}

// GitHub Integration
async function handleGitHubIntegration(accessToken: string, action: string, params: any) {
  const baseUrl = 'https://api.github.com';
  
  switch (action) {
    case 'get_repositories':
      const reposResponse = await fetch(`${baseUrl}/user/repos?sort=updated&per_page=${params.limit || 30}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });
      const reposData = await reposResponse.json();
      return new Response(JSON.stringify({ repositories: reposData }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    case 'get_commits':
      const commitsResponse = await fetch(`${baseUrl}/repos/${params.owner}/${params.repo}/commits?per_page=${params.limit || 20}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });
      const commitsData = await commitsResponse.json();
      return new Response(JSON.stringify({ commits: commitsData }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    default:
      throw new Error(`GitHub action ${action} not supported`);
  }
}

// Stripe Integration
async function handleStripeIntegration(accessToken: string, action: string, params: any) {
  const baseUrl = 'https://api.stripe.com/v1';
  
  switch (action) {
    case 'get_payments':
      const paymentsResponse = await fetch(`${baseUrl}/payment_intents?limit=${params.limit || 50}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      const paymentsData = await paymentsResponse.json();
      return new Response(JSON.stringify({ payments: paymentsData.data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    case 'get_customers':
      const customersResponse = await fetch(`${baseUrl}/customers?limit=${params.limit || 50}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      const customersData = await customersResponse.json();
      return new Response(JSON.stringify({ customers: customersData.data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    default:
      throw new Error(`Stripe action ${action} not supported`);
  }
}

// Shopify Integration
async function handleShopifyIntegration(accessToken: string, action: string, params: any) {
  const shopDomain = params.shopDomain || 'your-shop.myshopify.com';
  const baseUrl = `https://${shopDomain}/admin/api/2023-10`;
  
  switch (action) {
    case 'get_orders':
      const ordersResponse = await fetch(`${baseUrl}/orders.json?limit=${params.limit || 50}`, {
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json',
        },
      });
      const ordersData = await ordersResponse.json();
      return new Response(JSON.stringify({ orders: ordersData.orders }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    case 'get_products':
      const productsResponse = await fetch(`${baseUrl}/products.json?limit=${params.limit || 50}`, {
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json',
        },
      });
      const productsData = await productsResponse.json();
      return new Response(JSON.stringify({ products: productsData.products }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    default:
      throw new Error(`Shopify action ${action} not supported`);
  }
}

// Microsoft Teams Integration (simplified)
async function handleTeamsIntegration(accessToken: string, action: string, params: any) {
  const baseUrl = 'https://graph.microsoft.com/v1.0';
  
  switch (action) {
    case 'get_teams':
      const teamsResponse = await fetch(`${baseUrl}/me/joinedTeams`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      const teamsData = await teamsResponse.json();
      return new Response(JSON.stringify({ teams: teamsData.value }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    default:
      throw new Error(`Teams action ${action} not supported`);
  }
}

// Facebook Business Integration
async function handleFacebookIntegration(accessToken: string, action: string, params: any) {
  const baseUrl = 'https://graph.facebook.com/v18.0';
  
  switch (action) {
    case 'get_page_insights':
      const insightsResponse = await fetch(`${baseUrl}/${params.pageId}/insights?metric=page_views,page_fans&access_token=${accessToken}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const insightsData = await insightsResponse.json();
      return new Response(JSON.stringify(insightsData), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    default:
      throw new Error(`Facebook action ${action} not supported`);
  }
}

// LinkedIn Business Integration
async function handleLinkedInIntegration(accessToken: string, action: string, params: any) {
  const baseUrl = 'https://api.linkedin.com/v2';
  
  switch (action) {
    case 'get_profile':
      const profileResponse = await fetch(`${baseUrl}/people/~`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      const profileData = await profileResponse.json();
      return new Response(JSON.stringify(profileData), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    default:
      throw new Error(`LinkedIn action ${action} not supported`);
  }
}