import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { jwtVerify } from 'https://deno.land/x/jose@v5.2.4/jwt/verify.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify Mercado Pago webhook signature (JWT)
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized: Missing Authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const secret = Deno.env.get('MERCADOPAGO_WEBHOOK_SECRET');

    if (!secret) {
      console.error('MERCADOPAGO_WEBHOOK_SECRET is not set in environment variables.');
      return new Response(JSON.stringify({ error: 'Server configuration error: Mercado Pago secret missing.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    const { id: preapprovalId, topic } = payload as { id: string; topic: string };

    console.log(`Received Mercado Pago webhook: topic=${topic}, id=${preapprovalId}`);

    if (topic !== 'preapproval') {
      return new Response(JSON.stringify({ message: 'Not a preapproval topic, skipping.' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch preapproval details from Mercado Pago API
    const mpAccessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
    if (!mpAccessToken) {
      console.error('MERCADOPAGO_ACCESS_TOKEN is not set in environment variables.');
      return new Response(JSON.stringify({ error: 'Server configuration error: Mercado Pago access token missing.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const preapprovalResponse = await fetch(`https://api.mercadopago.com/preapproval/${preapprovalId}`, {
      headers: {
        'Authorization': `Bearer ${mpAccessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!preapprovalResponse.ok) {
      const errorText = await preapprovalResponse.text();
      console.error(`Error fetching preapproval from Mercado Pago: ${preapprovalResponse.status} - ${errorText}`);
      return new Response(JSON.stringify({ error: 'Failed to fetch preapproval details from Mercado Pago.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const preapproval = await preapprovalResponse.json();
    const userId = preapproval.external_reference;
    const status = preapproval.status; // e.g., 'authorized', 'cancelled', 'paused', 'pending'
    const preapprovalPlanId = preapproval.preapproval_plan_id;

    console.log(`Preapproval details: userId=${userId}, status=${status}, preapprovalPlanId=${preapprovalPlanId}`);

    if (!userId) {
      console.warn('Mercado Pago webhook payload missing external_reference (userId).');
      return new Response(JSON.stringify({ message: 'Missing user ID in external reference, skipping update.' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let activePlan = 'Experimental'; // Default to experimental or expired
    if (status === 'authorized') {
      if (preapprovalPlanId === '19630ab6bca048b8b0d95ff3cba64048') {
        activePlan = 'Mensal';
      } else if (preapprovalPlanId === '138bb5652fe7421a9b5c37fb575fb6e7') {
        activePlan = 'Anual';
      }
    } else if (status === 'cancelled' || status === 'paused' || status === 'rejected') {
      activePlan = 'Experimental'; // Or a specific 'Cancelled' status if you want to track it
    }
    // For 'pending' or 'in_process', we might keep the current plan or not update.
    // For simplicity, only 'authorized' explicitly sets a paid plan.

    // Update Supabase user profile
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { error: updateError } = await supabaseClient
      .from('profiles')
      .update({ active_plan: activePlan })
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating user profile in Supabase:', updateError);
      return new Response(JSON.stringify({ error: 'Failed to update user profile.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`User ${userId} active_plan updated to: ${activePlan}`);
    return new Response(JSON.stringify({ message: 'Webhook processed successfully.' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Mercado Pago webhook processing error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});