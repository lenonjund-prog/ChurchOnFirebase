declare const Deno: { env: { get(key: string): string | undefined } };
// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
// @ts-ignore
import Stripe from 'https://esm.sh/stripe@latest?target=deno'; // Atualizado para @latest

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('Edge Function stripe-webhook invoked!');

  try {
    const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    if (!stripeWebhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET is not set in environment variables.');
      return new Response(JSON.stringify({ error: 'Server configuration error: Stripe webhook secret missing.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    console.log('STRIPE_WEBHOOK_SECRET is present.');

    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      console.error('Missing Stripe signature header.');
      return new Response(JSON.stringify({ error: 'Missing Stripe signature header' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.text();
    const stripe = new Stripe(Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '', { // Using service role key for webhook verification
      apiVersion: '2024-06-20',
      httpClient: Stripe.createFetchHttpClient(),
    });

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, stripeWebhookSecret);
      console.log('Stripe Webhook event constructed successfully. Type:', event.type);
    } catch (err: unknown) {
      console.error(`Webhook signature verification failed: ${(err as Error).message}`);
      return new Response(JSON.stringify({ error: `Webhook Error: ${(err as Error).message}` }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.client_reference_id; // Assuming userId is passed as client_reference_id
      const customerEmail = session.customer_details?.email;
      const planName = session.metadata?.plan_name; // Assuming plan_name is passed in metadata

      console.log(`Checkout session completed for userId: ${userId}, email: ${customerEmail}, plan: ${planName}`);

      if (!userId && !customerEmail) {
        console.warn('Stripe session missing client_reference_id or customer_details.email. Cannot update user profile.');
        return new Response(JSON.stringify({ message: 'Missing user identifier, skipping profile update.' }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      let activePlan = 'Experimental';
      if (planName === 'Mensal') {
        activePlan = 'Mensal';
      } else if (planName === 'Anual') {
        activePlan = 'Anual';
      }

      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      let targetUserId = userId;

      // If client_reference_id is not set, try to find user by email
      if (!targetUserId && customerEmail) {
        console.log('Attempting to find user by email:', customerEmail);
        const { data: authUser, error: authError } = await supabaseClient.auth.admin.getUserByEmail(customerEmail);
        if (authError) {
          console.error('Error finding user by email for Stripe webhook:', authError);
          return new Response(JSON.stringify({ error: 'Failed to find user by email.' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        if (authUser.user) {
          targetUserId = authUser.user.id;
          console.log('User found by email. Target userId:', targetUserId);
        } else {
          console.warn('No user found by email:', customerEmail);
        }
      }

      if (targetUserId) {
        const { error: updateError } = await supabaseClient
          .from('profiles')
          .update({ active_plan: activePlan })
          .eq('id', targetUserId);

        if (updateError) {
          console.error('Error updating user profile in Supabase:', updateError);
          return new Response(JSON.stringify({ error: 'Failed to update user profile.' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        console.log(`User ${targetUserId} active_plan updated to: ${activePlan}`);
      } else {
        console.warn('Could not determine user ID from Stripe session or email. Profile not updated.');
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Stripe webhook processing error:', error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});