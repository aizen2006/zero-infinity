-- Add Google Calendar integration table
CREATE TABLE public.calendar_integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  google_access_token TEXT,
  google_refresh_token TEXT,
  google_calendar_id TEXT,
  is_connected BOOLEAN DEFAULT false,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.calendar_integrations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own calendar integrations"
ON public.calendar_integrations
FOR ALL
USING (auth.uid() = user_id);

-- Create events table for calendar data
CREATE TABLE public.calendar_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  google_event_id TEXT,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  attendees TEXT[],
  reminder_minutes INTEGER DEFAULT 15,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

-- Create policies  
CREATE POLICY "Users can manage their own calendar events"
ON public.calendar_events
FOR ALL
USING (auth.uid() = user_id);

-- Create trigger for timestamps
CREATE TRIGGER update_calendar_integrations_updated_at
BEFORE UPDATE ON public.calendar_integrations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_calendar_events_updated_at
BEFORE UPDATE ON public.calendar_events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes
CREATE INDEX idx_calendar_events_user_id ON public.calendar_events(user_id);
CREATE INDEX idx_calendar_events_start_time ON public.calendar_events(start_time);
CREATE INDEX idx_calendar_integrations_user_id ON public.calendar_integrations(user_id);