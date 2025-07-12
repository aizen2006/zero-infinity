-- Fix Gmail integration status for users who have connected but status shows as disconnected
UPDATE integrations 
SET is_connected = true 
WHERE app_name = 'gmail' 
AND oauth_token IS NOT NULL 
AND refresh_token IS NOT NULL 
AND is_connected = false;