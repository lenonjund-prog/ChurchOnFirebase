declare const Deno: { env: { get(key: string): string | undefined } };
// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('Edge Function create-pagbank-payment-intent invoked!');

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { data: { user } } = await supabaseClient.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { amount, planName } = await req.json();

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return new Response(JSON.stringify({ error: 'Invalid amount provided.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const pagbankSecretKey = Deno.env.get('PAGBANK_SECRET_KEY');
    if (!pagbankSecretKey) {
      console.error('PAGBANK_SECRET_KEY is not set.');
      return new Response(JSON.stringify({ error: 'Server configuration error: PagBank secret key missing.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // --- Placeholder for PagBank API call ---
    // This part needs to be adapted based on the actual PagBank API documentation
    // for creating a payment or subscription.
    // You would typically make a fetch request to the PagBank API here.
    // Example (conceptual, not actual PagBank API):
    const pagbankApiUrl = 'https://api.pagbank.com.br/charges'; // Replace with actual PagBank API endpoint
    const pagbankResponse = await fetch(pagbankApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${pagbankSecretKey}`,
        'x-api-version': '2024-06-20', // Or whatever version PagBank uses
      },
      body: JSON.stringify({
        reference_id: user.id, // Use user ID as reference
        description: `Assinatura do plano ${planName}`,
        amount: {
          value: Math.round(amount * 100), // PagBank também espera em centavos
          currency: 'BRL',
        },
        // Add other necessary PagBank parameters for subscriptions/charges
        // e.g., customer details, payment method details, return URLs
      }),
    });

    if (!pagbankResponse.ok) {
      const errorData = await pagbankResponse.json();
      console.error('PagBank API error:', errorData);
      return new Response(JSON.stringify({ error: `PagBank API error: ${errorData.message || 'Unknown error'}` }), {
        status: pagbankResponse.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const pagbankData = await pagbankResponse.json();
    // The response from PagBank will contain information needed for the frontend
    // to redirect the user or display a payment form.
    // For example, it might return a checkout URL or a payment ID.
    const checkoutUrl = pagbankData.links?.find((link: any) => link.rel === 'checkout')?.href; // Conceptual

    if (!checkoutUrl) {
        console.error('PagBank response missing checkout URL:', pagbankData);
        return new Response(JSON.stringify({ error: 'PagBank did not return a checkout URL.' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    return new Response(JSON.stringify({ checkoutUrl: checkoutUrl }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Error creating PagBank Payment Intent:', error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});