-- Enable HTTP extension for database functions to make HTTP calls
CREATE EXTENSION IF NOT EXISTS http;

-- Update the welcome email trigger to be non-blocking
-- If the email fails, it shouldn't prevent user signup
CREATE OR REPLACE FUNCTION public.send_welcome_email_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Use exception handling to prevent blocking user signup
  BEGIN
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
  EXCEPTION WHEN OTHERS THEN
    -- Log the error but don't fail the trigger
    RAISE LOG 'Failed to send welcome email for user %: %', NEW.id, SQLERRM;
  END;
  
  -- Always return NEW to allow the user creation to continue
  RETURN NEW;
END;
$$;

-- Update the notification email function to be more resilient
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
  -- Use exception handling for HTTP calls
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
  EXCEPTION WHEN OTHERS THEN
    -- Log the error but don't fail the function
    RAISE LOG 'Failed to send notification email to %: %', user_email, SQLERRM;
  END;
END;
$$;