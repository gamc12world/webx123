import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('RESEND_API_KEY');
    if (!apiKey) {
      throw new Error('RESEND_API_KEY environment variable is not set');
    }

    const { email, otp } = await req.json();
    if (!email || !otp) {
      throw new Error('Email and OTP are required');
    }

    console.log('Starting email send process...');
    console.log('Using API key:', `${apiKey.slice(0, 8)}...`);
    console.log('Original email:', email);
    console.log('Redirecting to test email: sbk520831@gmail.com');

    const resend = new Resend(apiKey);
    
    const { data, error } = await resend.emails.send({
      from: 'Stylish <onboarding@resend.dev>',
      to: 'sbk520831@gmail.com', // Always send to test email during testing
      subject: 'Your OTP for Stylish',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Your One-Time Password</h2>
          <p>Use the following OTP to complete your verification:</p>
          <h1 style="font-size: 32px; letter-spacing: 5px; color: #1e293b; text-align: center; padding: 20px; background: #f1f5f9; border-radius: 8px;">${otp}</h1>
          <p>This OTP will expire in 5 minutes.</p>
          <p>If you didn't request this OTP, please ignore this email.</p>
          <p style="color: #64748b; font-size: 12px;">Note: This is a test email. All verification codes are being sent to sbk520831@gmail.com for testing purposes.</p>
          <p style="color: #64748b; font-size: 12px;">Original email: ${email}</p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend API error:', error);
      throw error;
    }

    console.log('Email sent successfully:', data);

    return new Response(
      JSON.stringify({ 
        message: 'OTP sent successfully to test email', 
        data,
        debug: {
          emailSent: true,
          timestamp: new Date().toISOString(),
          testMode: true,
          originalEmail: email,
          actualRecipient: 'sbk520831@gmail.com'
        }
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      },
    );
  } catch (error) {
    console.error('Error in send-otp function:', error);
    
    const errorResponse = {
      error: error.message,
      type: error.name,
      details: error.response ? await error.response.text() : undefined,
      timestamp: new Date().toISOString()
    };

    return new Response(
      JSON.stringify(errorResponse),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      },
    );
  }
});