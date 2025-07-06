import { supabase } from '@/integrations/supabase/client';

export interface GmailEmail {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  to: string;
  date: string;
  snippet: string;
  isRead: boolean;
  isImportant: boolean;
  labels: string[];
  timestamp: number;
}

export interface GmailStats {
  totalEmails: number;
  unreadEmails: number;
  sentEmails: number;
  draftEmails: number;
  spamEmails: number;
}

export interface GmailAnalysis {
  totalEmails: number;
  unreadCount: number;
  importantCount: number;
  topSenders: Array<{ sender: string; count: number }>;
  emailTrends: Array<{ date: string; count: number }>;
  priorityEmails: GmailEmail[];
}

export const fetchGmailEmails = async (params?: {
  maxResults?: number;
  query?: string;
}): Promise<{ emails: GmailEmail[]; totalResults: number }> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No session');

    const { data, error } = await supabase.functions.invoke('gmail-integration', {
      body: {
        action: 'fetch_emails',
        ...params
      },
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      }
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching Gmail emails:', error);
    return { emails: [], totalResults: 0 };
  }
};

export const analyzeGmailData = async (): Promise<GmailAnalysis | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No session');

    const { data, error } = await supabase.functions.invoke('gmail-integration', {
      body: {
        action: 'analyze_emails'
      },
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      }
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error analyzing Gmail data:', error);
    return null;
  }
};

export const getGmailStats = async (): Promise<GmailStats | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No session');

    const { data, error } = await supabase.functions.invoke('gmail-integration', {
      body: {
        action: 'get_email_stats'
      },
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      }
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching Gmail stats:', error);
    return null;
  }
};

export const createEmailNotifications = async (emails: GmailEmail[]) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    // Filter priority emails (unread, important, or urgent)
    const priorityEmails = emails.filter(email => 
      !email.isRead && (
        email.isImportant || 
        email.subject.toLowerCase().includes('urgent') ||
        email.subject.toLowerCase().includes('important')
      )
    );

    // Create notifications for priority emails
    for (const email of priorityEmails) {
      await supabase
        .from('notifications')
        .insert({
          user_id: session.user.id,
          title: `New Email: ${email.subject}`,
          message: `From: ${email.from}\n${email.snippet}`,
          type: 'email',
          channel: 'gmail',
          metadata: {
            emailId: email.id,
            threadId: email.threadId,
            sender: email.from,
            isImportant: email.isImportant
          }
        });
    }
  } catch (error) {
    console.error('Error creating email notifications:', error);
  }
};