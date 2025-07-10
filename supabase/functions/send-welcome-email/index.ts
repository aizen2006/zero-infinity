import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const getWelcomeEmailTemplate = (displayName: string) => {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
        <div style="background: white; width: 60px; height: 60px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
          <div style="width: 30px; height: 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 6px; position: relative;">
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: white; font-size: 18px; font-weight: bold;">⚡</div>
          </div>
        </div>
        <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Welcome to ZERO!</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Your Business Intelligence Dashboard</p>
      </div>
      
      <div style="padding: 40px; border: 1px solid #e1e5e9; border-top: none; border-radius: 0 0 12px 12px;">
        <h2 style="color: #333; margin-bottom: 20px; font-size: 22px;">Hello ${displayName}! 👋</h2>
        
        <p style="color: #555; line-height: 1.6; font-size: 16px; margin-bottom: 25px;">
          Welcome to ZERO Dashboard - your all-in-one business intelligence platform. We're excited to have you on board!
        </p>

        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
          <h3 style="color: #333; margin-bottom: 15px; font-size: 18px;">🚀 Get Started</h3>
          <ul style="color: #555; line-height: 1.6; margin: 0; padding-left: 20px;">
            <li style="margin-bottom: 8px;"><strong>Connect your apps:</strong> Link Gmail, Google Analytics, and other tools</li>
            <li style="margin-bottom: 8px;"><strong>Set up widgets:</strong> Create custom dashboards for your data</li>
            <li style="margin-bottom: 8px;"><strong>Configure reminders:</strong> Never miss important updates</li>
            <li style="margin-bottom: 8px;"><strong>Explore AI insights:</strong> Get intelligent analysis of your data</li>
          </ul>
        </div>

        <div style="background-color: #e8f4fd; padding: 20px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #667eea;">
          <h3 style="color: #333; margin-bottom: 15px; font-size: 18px;">🤖 AI-Powered Features</h3>
          <p style="color: #555; line-height: 1.6; margin: 0;">
            ZERO comes with built-in AI capabilities to help you make sense of your data. Get automatic insights, 
            priority notifications, and intelligent responses to your messages.
          </p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="https://2660e35e-abb3-4d1e-ad5d-6769c5de2143.lovableproject.com/" 
             style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                    color: white; 
                    padding: 15px 30px; 
                    border-radius: 8px; 
                    text-decoration: none; 
                    font-weight: bold; 
                    font-size: 16px; 
                    display: inline-block;">
            Launch Your Dashboard
          </a>
        </div>

        <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #ffc107;">
          <h3 style="color: #333; margin-bottom: 15px; font-size: 18px;">💡 Pro Tips</h3>
          <ul style="color: #555; line-height: 1.6; margin: 0; padding-left: 20px;">
            <li style="margin-bottom: 8px;">Start with the Integrations page to connect your favorite tools</li>
            <li style="margin-bottom: 8px;">Use the AI Analysis feature in notifications for smarter prioritization</li>
            <li style="margin-bottom: 8px;">Check out the Insights page for automated business intelligence</li>
            <li style="margin-bottom: 8px;">Set up email notifications to stay updated on the go</li>
          </ul>
        </div>

        <p style="color: #666; font-size: 14px; line-height: 1.6;">
          If you have any questions or need help getting started, feel free to reach out to our support team. 
          We're here to help you succeed!
        </p>
      </div>
      
      <div style="text-align: center; padding: 20px; color: #666; font-size: 14px;">
        <p>This email was sent from your ZERO Dashboard</p>
        <p style="margin-top: 10px;">© 2024 ZERO. All rights reserved.</p>
      </div>
    </div>
  `;
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { record } = await req.json();
    
    console.log('Welcome email triggered for user:', record?.id);
    
    if (!record || !record.email) {
      throw new Error('No user record provided');
    }

    // Get user profile for display name
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('display_name')
      .eq('user_id', record.id)
      .single();

    const displayName = profile?.display_name || record.email.split('@')[0];

    const emailResponse = await resend.emails.send({
      from: "ZERO Dashboard <welcome@resend.dev>",
      to: [record.email],
      subject: "Welcome to ZERO Dashboard! 🚀",
      html: getWelcomeEmailTemplate(displayName),
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        emailId: emailResponse.data?.id 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error: any) {
    console.error("Error sending welcome email:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);