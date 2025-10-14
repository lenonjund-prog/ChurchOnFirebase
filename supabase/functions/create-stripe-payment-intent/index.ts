declare const Deno: { env: { get(key: string): string | undefined } };
// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
// @ts-ignore
import Stripe from 'https://esm.sh/stripe@latest'; // Atualizado para @latest

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Definir os preços dos planos no servidor para segurança
const PLAN_PRICES: { [key: string]: number } = {
  'Mensal': 59.90, // R$ 59,90
  'Anual': 600.00, // R$ 600,00
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('Edge Function create-stripe-payment-intent invoked!');

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('Authorization header missing in Edge Function request.');
      return new Response(JSON.stringify({ error: 'Authorization header missing' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const stripeSecretKey = Deno.env.get('Stripe_ChurchOn');

    console.log('SUPABASE_URL (Edge Function):', supabaseUrl ? 'Present' : 'Missing');
    console.log('SUPABASE_ANON_KEY (Edge Function):', supabaseAnonKey ? 'Present' : 'Missing');
    console.log('Stripe_ChurchOn (Edge Function):', stripeSecretKey ? 'Present' : 'Missing');


    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Supabase URL or Anon Key missing in Edge Function environment.');
      return new Response(JSON.stringify({ error: 'Server configuration error: Supabase keys missing.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseClient = createClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();

    if (authError) {
      console.error('Error getting user in Edge Function:', authError.message);
      return new Response(JSON.stringify({ error: `Authentication error: ${authError.message}` }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!user) {
      console.error('User is null after getUser() in Edge Function.');
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    console.log('User authenticated in Edge Function:', user.id);

    const { planName } = await req.json(); // Agora só recebemos o planName do cliente
    console.log('Received planName:', planName);

    // Validar o planName e obter o valor do plano do mapeamento do servidor
    const amount = PLAN_PRICES[planName];

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      console.error('Invalid plan name or amount configuration for plan:', planName, 'Amount:', amount);
      return new Response(JSON.stringify({ error: 'Invalid plan name or amount configuration.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    console.log('Calculated amount for plan:', planName, 'is:', amount);

    if (!stripeSecretKey) {
      console.error('Stripe_ChurchOn secret key is not set in environment variables.');
      return new Response(JSON.stringify({ error: 'Server configuration error: Stripe secret key missing.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    console.log('Stripe secret key is present.');

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2024-06-20',
      httpClient: Stripe.createFetchHttpClient(),
    });

    let paymentIntent;
    try {
      paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Usar o valor validado pelo servidor
        currency: 'brl',
        metadata: {
          userId: user.id,
          planName: planName,
        },
      });
      console.log('Stripe Payment Intent created. Client Secret:', paymentIntent.client_secret ? "YES" : "NO");
    } catch (stripeError: unknown) {
      console.error('Error creating Stripe Payment Intent with Stripe API:', (stripeError as Error).message);
      return new Response(JSON.stringify({ error: `Stripe API error: ${(stripeError as Error).message}` }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }


    return new Response(JSON.stringify({ clientSecret: paymentIntent.client_secret }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Unhandled error in Edge Function create-stripe-payment-intent:', error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});