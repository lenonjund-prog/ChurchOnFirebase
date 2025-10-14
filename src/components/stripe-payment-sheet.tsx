"use client";

import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { loadStripe, StripeElementsOptions, Appearance, Stripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { StripeCheckoutForm } from './stripe-checkout-form';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useSession } from '@/components/supabase-session-provider';

// Variável para armazenar a promessa do Stripe, garantindo que loadStripe seja chamado apenas uma vez.
let _stripePromise: Promise<Stripe | null> | null = null;

// Função para obter a promessa do Stripe, com verificação da chave.
const getStripePromise = (toast: ReturnType<typeof useToast>['toast'], onOpenChange: (open: boolean) => void) => {
  if (!_stripePromise) {
    const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    console.log("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (client-side, getStripePromise):", stripePublishableKey ? "Present" : "Missing");

    if (!stripePublishableKey) {
      console.error("Stripe publishable key is missing. Cannot load Stripe.");
      toast({
        variant: "destructive",
        title: "Erro de configuração",
        description: "A chave publicável do Stripe não foi encontrada. Por favor, verifique suas variáveis de ambiente no Vercel.",
      });
      onOpenChange(false);
      return Promise.resolve(null); // Retorna uma promessa resolvida com null para evitar erros
    }
    _stripePromise = loadStripe(stripePublishableKey);
  }
  return _stripePromise;
};

type StripePaymentSheetProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  appName: string;
  planName: string;
  amount: number;
  userId: string;
};

export function StripePaymentSheet({ isOpen, onOpenChange, appName, planName, amount, userId }: StripePaymentSheetProps) {
  const { toast } = useToast();
  const { session } = useSession();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [stripeInstance, setStripeInstance] = useState<Stripe | null>(null); // Estado para a instância do Stripe

  // Efeito para carregar a instância do Stripe.js
  useEffect(() => {
    if (isOpen) { // Só tenta carregar o Stripe se a sheet estiver aberta
      getStripePromise(toast, onOpenChange).then(instance => {
        if (instance) {
          setStripeInstance(instance);
          console.log("Stripe.js instance loaded and set.");
        } else {
          console.error("Failed to get Stripe.js instance.");
          // O toast já foi disparado dentro de getStripePromise se a chave estiver faltando
        }
      });
    } else {
      // Resetar a instância do Stripe quando a sheet fechar
      setStripeInstance(null);
    }
  }, [isOpen, toast, onOpenChange]);


  // Efeito para buscar o clientSecret da função Edge
  useEffect(() => {
    console.log("StripePaymentSheet client secret fetch effect triggered. isOpen:", isOpen, "amount:", amount, "userId:", userId, "session:", !!session, "stripeInstance:", !!stripeInstance);

    if (isOpen && amount > 0 && userId && session?.access_token && stripeInstance) {
      setLoading(true);
      
      const edgeFunctionUrl = `https://aivayoleogjvgpkvxmkq.supabase.co/functions/v1/create-stripe-payment-intent`;
      console.log('Fetching client secret from:', edgeFunctionUrl);

      fetch(edgeFunctionUrl, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ planName }), // Passando apenas planName, o valor é validado no Edge Function
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            console.error("Error response from Edge Function:", data.error);
            throw new Error(data.error);
          }
          console.log("Client secret received:", data.clientSecret ? "YES" : "NO");
          setClientSecret(data.clientSecret);
        })
        .catch((error) => {
          console.error("Error fetching client secret:", error);
          toast({
            variant: "destructive",
            title: "Erro ao iniciar pagamento",
            description: error.message || "Não foi possível iniciar o processo de pagamento. Verifique os logs da função Edge do Supabase.",
          });
          onOpenChange(false);
        })
        .finally(() => setLoading(false));
    } else if (!isOpen) {
      setClientSecret(null);
    }
  }, [isOpen, amount, planName, userId, toast, onOpenChange, session?.access_token, stripeInstance]); // Depende de stripeInstance

  const appearance: Appearance = {
    theme: 'stripe',
  };
  const options: StripeElementsOptions = {
    clientSecret: clientSecret || undefined,
    appearance,
  };

  const handlePaymentSuccess = () => {
    toast({
      title: "Pagamento realizado com sucesso!",
      description: "Seu plano foi atualizado. Pode levar alguns instantes para refletir.",
    });
    onOpenChange(false);
  };

  const handlePaymentError = (message: string) => {
    toast({
      variant: "destructive",
      title: "Erro no pagamento",
      description: message,
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Assinar {appName} - Plano {planName}</SheetTitle>
          <SheetDescription>
            Preencha os detalhes do seu cartão para concluir a assinatura de {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount)}.
          </SheetDescription>
        </SheetHeader>
        {loading || !clientSecret || !stripeInstance ? ( // Agora verifica stripeInstance
          <div className="flex flex-col items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="mt-2 text-muted-foreground">Carregando formulário de pagamento...</p>
            {!stripeInstance && <p className="text-sm text-destructive mt-1">Aguardando carregamento do Stripe.js ou chave ausente.</p>}
            {loading && clientSecret === null && <p className="text-sm text-muted-foreground mt-1">Buscando detalhes do pagamento...</p>}
          </div>
        ) : (
          <Elements options={options} stripe={stripeInstance}> {/* Passa a instância do Stripe */}
            <StripeCheckoutForm
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentError={handlePaymentError}
              onSheetClose={() => onOpenChange(false)}
            />
          </Elements>
        )}
      </SheetContent>
    </Sheet>
  );
}