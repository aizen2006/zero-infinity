-- Fix reminders table constraint issue by updating the check constraint
-- First drop existing constraint if it exists
ALTER TABLE public.reminders DROP CONSTRAINT IF EXISTS reminders_trigger_type_check;

-- Add proper check constraint for trigger_type to include all valid values
ALTER TABLE public.reminders 
ADD CONSTRAINT reminders_trigger_type_check 
CHECK (trigger_type IN ('real-time', 'daily', 'weekly', 'monthly', 'when-met', 'real_time', 'when_met'));

-- Ensure notification channels column has proper values
UPDATE public.reminders 
SET notification_channels = ARRAY['in_app'::text] 
WHERE notification_channels IS NULL OR notification_channels = '{}';

-- Add constraint for notification channels
ALTER TABLE public.reminders 
ADD CONSTRAINT reminders_notification_channels_check 
CHECK (notification_channels <@ ARRAY['email', 'in_app', 'in-app']);