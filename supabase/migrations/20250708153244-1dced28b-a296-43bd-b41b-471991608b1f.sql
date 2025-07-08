-- Create a webhook trigger to send welcome email when a new user signs up
-- This will be triggered by the auth.users table insert

-- First, let's create a function to handle the trigger
CREATE OR REPLACE FUNCTION public.send_welcome_email_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Call the welcome email edge function
  PERFORM
    net.http_post(
      url := 'https://tvqwujlpgqoofmmvzxzw.supabase.co/functions/v1/send-welcome-email',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.service_role_key') || '"}',
      body := json_build_object(
        'record', json_build_object(
          'id', NEW.id,
          'email', NEW.email,
          'created_at', NEW.created_at
        )
      )::text
    );
  RETURN NEW;
END;
$$;

-- Create the trigger on auth.users table
CREATE OR REPLACE TRIGGER send_welcome_email_on_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.send_welcome_email_trigger();

-- Also create a function to send notification emails from the database
CREATE OR REPLACE FUNCTION public.send_notification_email_db(
  user_email text,
  email_subject text,
  email_content text,
  email_type text DEFAULT 'notification',
  notification_id uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM
    net.http_post(
      url := 'https://tvqwujlpgqoofmmvzxzw.supabase.co/functions/v1/send-notification-email',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.service_role_key') || '"}',
      body := json_build_object(
        'to', user_email,
        'subject', email_subject,
        'content', email_content,
        'type', email_type,
        'notificationId', notification_id
      )::text
    );
END;
$$;