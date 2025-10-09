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

    // Use a variável de ambiente para determinar o ambiente (produção ou sandbox)
    // Por enquanto, vamos usar o sandbox diretamente.
    // Você pode adicionar uma variável de ambiente como PAGBANK_ENV = 'production' ou 'sandbox'
    // e alternar a URL base com base nela.
    const pagbankBaseUrl = 'https://sandbox.api.pagseguro.com'; // URL de Teste (Sandbox)
    // Para produção, use: 'https://api.pagseguro.com';
    const pagbankApiUrl = `${pagbankBaseUrl}/charges`; // Endpoint para criar cobranças

    const returnUrl = `${req.headers.get('origin')}/dashboard/subscriptions?pagbank_status=success`; // URL de retorno após o pagamento

    const pagbankResponse = await fetch(pagbankApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${pagbankSecretKey}`,
        'x-api-version': '2024-06-20', // Verifique a versão da API PagBank
      },
      body: JSON.stringify({
        reference_id: user.id, // Use user ID como referência
        description: `Assinatura do plano ${planName}`,
        amount: {
          value: Math.round(amount * 100), // PagBank espera o valor em centavos
          currency: 'BRL',
        },
        payment_method: { // Exemplo de como PagBank pode esperar o método de pagamento
            type: 'CREDIT_CARD', // Ou 'BOLETO', 'PIX', etc.
            // Outros detalhes do método de pagamento seriam adicionados aqui,
            // mas para um redirecionamento de checkout, talvez não sejam necessários inicialmente.
        },
        notification_urls: [ // URLs para webhooks, se aplicável
            // Você precisará de uma Edge Function para receber esses webhooks
            // Ex: `https://aivayoleogjvgpkvxmkq.supabase.co/functions/v1/pagbank-webhook`
        ],
        redirect_url: returnUrl, // URL para onde o PagBank deve redirecionar o usuário
        // Adicione outros parâmetros necessários para assinaturas/cobranças conforme a documentação do PagBank
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
    // A resposta do PagBank deve conter uma URL de checkout para redirecionar o usuário.
    // O nome do campo pode variar (ex: `links`, `checkout_url`, etc.).
    const checkoutUrl = pagbankData.links?.find((link: any) => link.rel === 'CHECKOUT')?.href || pagbankData.checkout_url; // Adapte conforme a resposta real do PagBank

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