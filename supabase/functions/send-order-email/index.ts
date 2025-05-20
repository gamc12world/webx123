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

    const { email, orderNumber, status, items, total, shippingAddress } = await req.json();

    const resend = new Resend(apiKey);

    let subject = '';
    let statusMessage = '';

    switch (status) {
      case 'processing':
        subject = `Order #${orderNumber} is being processed`;
        statusMessage = 'Your order is now being processed';
        break;
      case 'shipped':
        subject = `Order #${orderNumber} has been shipped`;
        statusMessage = 'Your order is on its way';
        break;
      case 'delivered':
        subject = `Order #${orderNumber} has been delivered`;
        statusMessage = 'Your order has been delivered';
        break;
      case 'cancelled':
        subject = `Order #${orderNumber} has been cancelled`;
        statusMessage = 'Your order has been cancelled';
        break;
      default:
        subject = `Update on your order #${orderNumber}`;
        statusMessage = `Your order status has been updated to: ${status}`;
    }

    const itemsList = items.map((item: any) => `
      <tr>
        <td style="padding: 12px;">${item.product.name}</td>
        <td style="padding: 12px;">Size: ${item.size}, Color: ${item.color}</td>
        <td style="padding: 12px;">${item.quantity}</td>
        <td style="padding: 12px;">$${item.product.price.toFixed(2)}</td>
      </tr>
    `).join('');

    const { data, error } = await resend.emails.send({
      from: 'Stylish <orders@stylish.com>',
      to: email,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #1e293b; margin-bottom: 24px;">${statusMessage}</h1>
          
          <p style="color: #475569; margin-bottom: 24px;">
            Order #${orderNumber}<br>
            Status: <strong>${status.charAt(0).toUpperCase() + status.slice(1)}</strong>
          </p>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
            <thead style="background-color: #f8fafc;">
              <tr>
                <th style="padding: 12px; text-align: left;">Product</th>
                <th style="padding: 12px; text-align: left;">Details</th>
                <th style="padding: 12px; text-align: left;">Quantity</th>
                <th style="padding: 12px; text-align: left;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsList}
            </tbody>
          </table>

          <div style="margin-bottom: 24px;">
            <p style="font-weight: bold; color: #1e293b;">Total: $${total.toFixed(2)}</p>
          </div>

          <div style="margin-bottom: 24px;">
            <h2 style="color: #1e293b; font-size: 18px;">Shipping Address</h2>
            <p style="color: #475569;">
              ${shippingAddress.fullName}<br>
              ${shippingAddress.streetAddress}<br>
              ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.postalCode}<br>
              ${shippingAddress.country}
            </p>
          </div>

          <div style="color: #64748b; font-size: 14px; margin-top: 32px;">
            <p>Thank you for shopping with Stylish!</p>
            <p>If you have any questions, please contact our support team.</p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('Resend API error:', error);
      throw error;
    }

    return new Response(
      JSON.stringify({ 
        message: 'Order status email sent successfully',
        data 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      },
    );
  } catch (error) {
    console.error('Error sending order status email:', error);
    
    return new Response(
      JSON.stringify({
        error: error.message,
      }),
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