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
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('Authorization header missing in Edge Function request.');
      return new Response(JSON.stringify({ error: 'Authorization header missing' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
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

    const pagbankBaseUrl = 'https://api.pagseguro.com';
    // Alterado o endpoint para /checkouts
    const pagbankApiUrl = `${pagbankBaseUrl}/checkouts`; 

    const returnUrl = `${req.headers.get('origin')}/dashboard/subscriptions?pagbank_status=success`;

    const pagbankResponse = await fetch(pagbankApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${pagbankSecretKey}`,
        'x-api-version': '2024-06-20',
      },
      body: JSON.stringify({
        reference_id: user.id,
        customer: { // Adicionado detalhes do cliente
          email: user.email,
          // Você pode adicionar mais detalhes do cliente aqui se tiver no perfil do Supabase
          // name: `${userProfile.first_name} ${userProfile.last_name}`,
        },
        items: [ // Itens da compra para o checkout
          {
            name: `Assinatura do plano ${planName}`,
            quantity: 1,
            unit_amount: Math.round(amount * 100), // Valor em centavos
          },
        ],
        // Removido payment_method, pois o usuário escolherá na página de checkout do PagBank
        redirect_url: returnUrl,
        // Opcional: notification_urls para webhooks do PagBank, se configurado
        // notification_urls: [`${Deno.env.get('SUPABASE_URL')}/functions/v1/pagbank-webhook`],
      }),
    });

    if (!pagbankResponse.ok) {
      const errorData = await pagbankResponse.json();
      console.error('PagBank API error response status:', pagbankResponse.status);
      console.error('PagBank API error response body:', JSON.stringify(errorData, null, 2));
      return new Response(JSON.stringify({ error: `PagBank API error: ${errorData.message || JSON.stringify(errorData) || 'Unknown error'}` }), {
        status: pagbankResponse.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const pagbankData = await pagbankResponse.json();
    // O PagBank para o endpoint /checkouts retorna a URL de checkout diretamente no campo 'links'
    const checkoutUrl = pagbankData.links?.find((link: any) => link.rel === 'CHECKOUT')?.href;

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