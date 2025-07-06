import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Users, Plus, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  location?: string;
  attendees?: string[];
  reminderMinutes: number;
}

interface CalendarIntegrationProps {
  onEventSelect?: (event: CalendarEvent) => void;
}

export const CalendarIntegration: React.FC<CalendarIntegrationProps> = ({ onEventSelect }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    checkConnection();
    fetchEvents();
  }, [user]);

  const checkConnection = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('calendar_integrations')
        .select('is_connected')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setIsConnected(data.is_connected);
      }
    } catch (error) {
      console.error('Error checking calendar connection:', error);
    }
  };

  const fetchEvents = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', user.id)
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true })
        .limit(10);

      if (error) throw error;

      const mappedEvents: CalendarEvent[] = data.map(event => ({
        id: event.id,
        title: event.title,
        description: event.description,
        startTime: event.start_time,
        endTime: event.end_time,
        location: event.location,
        attendees: event.attendees,
        reminderMinutes: event.reminder_minutes
      }));

      setEvents(mappedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: "Error",
        description: "Failed to fetch calendar events",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const connectGoogleCalendar = async () => {
    const clientId = 'your-google-client-id'; // This should come from environment
    const redirectUri = `${window.location.origin}/oauth/google-calendar`;
    const scope = 'https://www.googleapis.com/auth/calendar.readonly';
    
    const authUrl = `https://accounts.google.com/oauth/authorize?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=${encodeURIComponent(scope)}&` +
      `response_type=code&` +
      `access_type=offline&` +
      `prompt=consent`;
    
    window.location.href = authUrl;
  };

  const syncEvents = async () => {
    setLoading(true);
    try {
      // This would call a Supabase function to sync with Google Calendar API
      const { data, error } = await supabase.functions.invoke('sync-google-calendar', {
        body: { userId: user?.id }
      });

      if (error) throw error;

      await fetchEvents();
      toast({
        title: "Success",
        description: "Calendar events synced successfully",
      });
    } catch (error) {
      console.error('Error syncing events:', error);
      toast({
        title: "Error",
        description: "Failed to sync calendar events",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createReminder = async (event: CalendarEvent) => {
    try {
      const { error } = await supabase
        .from('reminders')
        .insert({
          user_id: user?.id,
          title: `Meeting: ${event.title}`,
          description: `Upcoming meeting at ${new Date(event.startTime).toLocaleString()}`,
          trigger_type: 'time',
          trigger_config: {
            datetime: new Date(new Date(event.startTime).getTime() - event.reminderMinutes * 60000).toISOString()
          },
          notification_channels: ['email', 'browser']
        });

      if (error) throw error;

      toast({
        title: "Reminder Created",
        description: `Reminder set for ${event.title}`,
      });
    } catch (error) {
      console.error('Error creating reminder:', error);
      toast({
        title: "Error",
        description: "Failed to create reminder",
        variant: "destructive"
      });
    }
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  if (!isConnected) {
    return (
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Google Calendar Integration
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="text-muted-foreground">
            Connect your Google Calendar to sync events and create smart reminders
          </div>
          <Button onClick={connectGoogleCalendar} className="shadow-elegant">
            <Calendar className="w-4 h-4 mr-2" />
            Connect Google Calendar
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-elegant">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Upcoming Events
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {events.length} events
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={syncEvents}
              disabled={loading}
            >
              <RefreshCw className={`w-3 h-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Sync
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-muted-foreground mt-2">Loading events...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
            No upcoming events
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event) => {
              const { date, time } = formatDateTime(event.startTime);
              return (
                <div
                  key={event.id}
                  className="flex items-start gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => onEventSelect?.(event)}
                >
                  <div className="flex-shrink-0 w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium truncate">{event.title}</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          createReminder(event);
                        }}
                        className="text-xs h-6"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Remind
                      </Button>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {date} at {time}
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {event.location}
                        </div>
                      )}
                      {event.attendees && event.attendees.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {event.attendees.length} attendees
                        </div>
                      )}
                    </div>
                    
                    {event.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {event.description}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};