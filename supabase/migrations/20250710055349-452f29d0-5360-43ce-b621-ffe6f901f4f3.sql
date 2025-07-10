-- Fix the welcome email trigger to use correct HTTP function
CREATE OR REPLACE FUNCTION public.send_welcome_email_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Use exception handling to prevent blocking user signup
  BEGIN
    PERFORM
      http_post(
        url := 'https://tvqwujlpgqoofmmvzxzw.supabase.co/functions/v1/send-welcome-email',
        headers := ARRAY[
          http_header('Content-Type', 'application/json'),
          http_header('Authorization', 'Bearer ' || current_setting('app.settings.service_role_key'))
        ],
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

-- Fix the notification email function to use correct HTTP function
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
      http_post(
        url := 'https://tvqwujlpgqoofmmvzxzw.supabase.co/functions/v1/send-notification-email',
        headers := ARRAY[
          http_header('Content-Type', 'application/json'),
          http_header('Authorization', 'Bearer ' || current_setting('app.settings.service_role_key'))
        ],
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

-- Create the trigger for welcome emails if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.send_welcome_email_trigger();
  END IF;
END $$;