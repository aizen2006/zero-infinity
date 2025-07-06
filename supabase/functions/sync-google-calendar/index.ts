import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
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

    const { userId } = await req.json();

    // Get user's Google Calendar integration
    const { data: integration, error: integrationError } = await supabaseClient
      .from('calendar_integrations')
      .select('google_access_token, google_refresh_token')
      .eq('user_id', userId)
      .single();

    if (integrationError || !integration) {
      throw new Error('Google Calendar not connected');
    }

    // Fetch events from Google Calendar API
    const calendarResponse = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?` +
      `timeMin=${new Date().toISOString()}&` +
      `maxResults=50&` +
      `singleEvents=true&` +
      `orderBy=startTime`,
      {
        headers: {
          'Authorization': `Bearer ${integration.google_access_token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!calendarResponse.ok) {
      throw new Error(`Google Calendar API error: ${calendarResponse.statusText}`);
    }

    const calendarData = await calendarResponse.json();
    
    // Process and store events
    const events = calendarData.items?.map((event: any) => ({
      user_id: userId,
      google_event_id: event.id,
      title: event.summary || 'Untitled Event',
      description: event.description || null,
      start_time: event.start?.dateTime || event.start?.date,
      end_time: event.end?.dateTime || event.end?.date,
      location: event.location || null,
      attendees: event.attendees?.map((attendee: any) => attendee.email) || [],
      reminder_minutes: 15, // Default reminder
    })) || [];

    // Clear existing events and insert new ones
    await supabaseClient
      .from('calendar_events')
      .delete()
      .eq('user_id', userId);

    if (events.length > 0) {
      const { error: insertError } = await supabaseClient
        .from('calendar_events')
        .insert(events);

      if (insertError) {
        throw new Error(`Failed to store events: ${insertError.message}`);
      }
    }

    // Update last sync time
    await supabaseClient
      .from('calendar_integrations')
      .update({ last_sync_at: new Date().toISOString() })
      .eq('user_id', userId);

    return new Response(JSON.stringify({ 
      success: true,
      eventsCount: events.length,
      message: `Synced ${events.length} events successfully`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in sync-google-calendar function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});