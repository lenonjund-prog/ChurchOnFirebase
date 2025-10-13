"use client";

import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { loadStripe, StripeElementsOptions, Appearance } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { StripeCheckoutForm } from './stripe-checkout-form';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useSession } from '@/components/supabase-session-provider';

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

type StripePaymentSheetProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  appName: string;
  planName: string;
  amount: number;
};

export function StripePaymentSheet({ isOpen, onOpenChange, appName, planName, amount }: StripePaymentSheetProps) {
  const { toast } = useToast();
  const { session, user, loading: sessionLoading } = useSession();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchClientSecret() {
      // Only proceed if the sheet is open, amount is valid, and user is authenticated
      if (!isOpen || amount <= 0 || !user || !session?.access_token) {
        // If sheet is not open, amount is invalid, or user/session is missing, do nothing.
        // The `else if` block below handles cases where `user` or `session` become invalid while `isOpen` is true.
        return;
      }

      setLoading(true);
      const currentAccessToken = session.access_token; // Use the current access token from the session

      try {
        const edgeFunctionUrl = `https://aivayoleogjvgpkvxmkq.supabase.co/functions/v1/create-stripe-payment-intent`;
        console.log('Fetching client secret from:', edgeFunctionUrl);

        const res = await fetch(edgeFunctionUrl, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${currentAccessToken}` // Use the current token
          },
          body: JSON.stringify({ amount, planName }),
        });

        const data = await res.json();

        if (data.error) {
          throw new Error(data.error);
        }
        setClientSecret(data.clientSecret);

      } catch (error: any) {
        console.error("Error fetching client secret:", error);
        toast({
          variant: "destructive",
          title: "Erro ao iniciar pagamento",
          description: error.message || "Não foi possível iniciar o processo de pagamento. Por favor, tente fazer login novamente.",
        });
        onOpenChange(false); // Close the sheet on error
      } finally {
        setLoading(false);
      }
    }

    if (isOpen && !sessionLoading) {
      fetchClientSecret();
    } else if (!isOpen) {
      setClientSecret(null);
    }
  }, [isOpen, amount, planName, user, session?.access_token, sessionLoading, toast, onOpenChange]);

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
        {loading || !clientSecret ? (
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