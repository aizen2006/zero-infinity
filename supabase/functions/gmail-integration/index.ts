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

    const { action, ...params } = await req.json();

    // Get Gmail integration details
    const { data: integration } = await supabaseClient
      .from('integrations')
      .select('*')
      .eq('user_id', user.id)
      .eq('app_name', 'gmail')
      .eq('is_connected', true)
      .single();

    if (!integration) {
      throw new Error('Gmail integration not found');
    }

    // Check if token is expired and refresh if needed
    let accessToken = integration.oauth_token;
    const tokenExpiresAt = new Date(integration.token_expires_at);
    const now = new Date();
    
    if (now >= tokenExpiresAt) {
      console.log('Token expired, refreshing...');
      try {
        const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            client_id: Deno.env.get('GOOGLE_CLIENT_ID') || '',
            client_secret: Deno.env.get('GOOGLE_CLIENT_SECRET') || '',
            refresh_token: integration.refresh_token,
            grant_type: 'refresh_token',
          }),
        });

        if (!refreshResponse.ok) {
          throw new Error(`Token refresh failed: ${refreshResponse.statusText}`);
        }

        const refreshData = await refreshResponse.json();
        accessToken = refreshData.access_token;
        
        // Update the integration with new token
        const newExpiresAt = new Date(Date.now() + refreshData.expires_in * 1000);
        await supabaseClient
          .from('integrations')
          .update({
            oauth_token: accessToken,
            token_expires_at: newExpiresAt.toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', integration.id);
        
        console.log('Token refreshed successfully');
      } catch (refreshError) {
        console.error('Failed to refresh token:', refreshError);
        throw new Error('Gmail authentication expired. Please reconnect your Gmail account.');
      }
    }

    switch (action) {
      case 'fetch_emails':
        return await fetchEmails(accessToken, params);
      case 'analyze_emails':
        return await analyzeEmails(accessToken, params);
      case 'get_email_stats':
        return await getEmailStats(accessToken, params);
      default:
        throw new Error('Invalid action');
    }

  } catch (error) {
    console.error('Error in gmail-integration function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function fetchEmails(accessToken: string, params: any) {
  const maxResults = params.maxResults || 20;
  const query = params.query || 'in:inbox';

  const response = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}&maxResults=${maxResults}`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Gmail API error: ${response.statusText}`);
  }

  const data = await response.json();
  const emails = [];

  // Fetch details for each email
  for (const message of data.messages || []) {
    const detailResponse = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (detailResponse.ok) {
      const emailDetail = await detailResponse.json();
      const headers = emailDetail.payload?.headers || [];
      
      const getHeader = (name: string) => headers.find((h: any) => h.name === name)?.value || '';

      emails.push({
        id: emailDetail.id,
        threadId: emailDetail.threadId,
        subject: getHeader('Subject'),
        from: getHeader('From'),
        to: getHeader('To'),
        date: getHeader('Date'),
        snippet: emailDetail.snippet,
        isRead: !emailDetail.labelIds?.includes('UNREAD'),
        isImportant: emailDetail.labelIds?.includes('IMPORTANT'),
        labels: emailDetail.labelIds || [],
        timestamp: parseInt(emailDetail.internalDate),
      });
    }
  }

  return new Response(JSON.stringify({ 
    emails,
    totalResults: data.resultSizeEstimate || 0
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function analyzeEmails(accessToken: string, params: any) {
  // Get recent emails for analysis
  const emailsResponse = await fetchEmails(accessToken, { maxResults: 50, query: 'newer_than:7d' });
  const emailsData = await emailsResponse.json();
  
  const analysis = {
    totalEmails: emailsData.emails.length,
    unreadCount: emailsData.emails.filter((e: any) => !e.isRead).length,
    importantCount: emailsData.emails.filter((e: any) => e.isImportant).length,
    topSenders: getTopSenders(emailsData.emails),
    emailTrends: getEmailTrends(emailsData.emails),
    priorityEmails: emailsData.emails
      .filter((e: any) => !e.isRead && (e.isImportant || e.subject.toLowerCase().includes('urgent')))
      .slice(0, 10),
  };

  return new Response(JSON.stringify(analysis), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function getEmailStats(accessToken: string, params: any) {
  const stats = {
    totalEmails: 0,
    unreadEmails: 0,
    sentEmails: 0,
    draftEmails: 0,
    spamEmails: 0,
  };

  // Get inbox stats
  const inboxResponse = await fetch(
    'https://gmail.googleapis.com/gmail/v1/users/me/labels/INBOX',
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (inboxResponse.ok) {
    const inboxData = await inboxResponse.json();
    stats.totalEmails = inboxData.messagesTotal || 0;
    stats.unreadEmails = inboxData.messagesUnread || 0;
  }

  // Get sent emails count
  const sentResponse = await fetch(
    'https://gmail.googleapis.com/gmail/v1/users/me/labels/SENT',
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (sentResponse.ok) {
    const sentData = await sentResponse.json();
    stats.sentEmails = sentData.messagesTotal || 0;
  }

  return new Response(JSON.stringify(stats), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function getTopSenders(emails: any[]) {
  const senderCount: { [key: string]: number } = {};
  
  emails.forEach(email => {
    const sender = email.from;
    if (sender) {
      senderCount[sender] = (senderCount[sender] || 0) + 1;
    }
  });

  return Object.entries(senderCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([sender, count]) => ({ sender, count }));
}

function getEmailTrends(emails: any[]) {
  const dailyCount: { [key: string]: number } = {};
  
  emails.forEach(email => {
    const date = new Date(email.timestamp).toDateString();
    dailyCount[date] = (dailyCount[date] || 0) + 1;
  });

  return Object.entries(dailyCount)
    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
    .map(([date, count]) => ({ date, count }));
}