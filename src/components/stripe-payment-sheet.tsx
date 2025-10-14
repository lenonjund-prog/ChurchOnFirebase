"use client";

import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { loadStripe, StripeElementsOptions, Appearance, Stripe } from '@stripe/stripe-js'; // Importar Stripe type
import { Elements } from '@stripe/react-stripe-js';
import { StripeCheckoutForm } from './stripe-checkout-form';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useSession } from '@/components/supabase-session-provider';

let stripePromise: Promise<Stripe | null> | null = null;

export function StripePaymentSheet({ isOpen, onOpenChange, appName, planName, amount, userId }: StripePaymentSheetProps) {
  const { toast } = useToast();
  const { session } = useSession();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [stripeLoaded, setStripeLoaded] = useState(false); // Novo estado para controlar o carregamento do Stripe

  useEffect(() => {
    const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    console.log("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (client-side):", stripePublishableKey ? "Present" : "Missing");

    if (!stripePublishableKey) {
      console.error("Stripe publishable key is missing. Cannot load Stripe.");
      toast({
        variant: "destructive",
        title: "Erro de configuração",
        description: "A chave publicável do Stripe não foi encontrada. Por favor, verifique suas variáveis de ambiente.",
      });
      setLoading(false);
      onOpenChange(false);
      return;
    }

    if (!stripePromise) {
      stripePromise = loadStripe(stripePublishableKey);
      stripePromise.then(stripeInstance => {
        if (stripeInstance) {
          setStripeLoaded(true);
          console.log("Stripe.js loaded successfully.");
        } else {
          console.error("Failed to load Stripe.js.");
          toast({
            variant: "destructive",
            title: "Erro de carregamento",
            description: "Não foi possível carregar o Stripe.js. Verifique sua conexão ou configurações.",
          });
          setLoading(false);
          onOpenChange(false);
        }
      });
    }
  }, [toast, onOpenChange]);


  useEffect(() => {
    console.log("StripePaymentSheet mounted. NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:", process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

    if (isOpen && amount > 0 && userId && session?.access_token && stripeLoaded) { // Adicionado stripeLoaded
      setLoading(true);
      
      // Use the direct Supabase Edge Function URL
      const edgeFunctionUrl = `https://aivayoleogjvgpkvxmkq.supabase.co/functions/v1/create-stripe-payment-intent`;
      console.log('Fetching client secret from:', edgeFunctionUrl); // Log the URL being fetched

      fetch(edgeFunctionUrl, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ amount, planName }),
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
            description: error.message || "Não foi possível iniciar o processo de pagamento.",
          });
          onOpenChange(false);
        })
        .finally(() => setLoading(false));
    } else if (!isOpen) {
      setClientSecret(null);
    }
  }, [isOpen, amount, planName, userId, toast, onOpenChange, session?.access_token, stripeLoaded]); // Adicionado stripeLoaded

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
        {loading || !clientSecret || !stripeLoaded ? ( // Adicionado !stripeLoaded
          <div className="flex flex-col items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="mt-2 text-muted-foreground">Carregando formulário de pagamento...</p>
          </div>
        ) : (
          <Elements options={options} stripe={stripePromise}>
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