"use client";

import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { StripeCheckoutForm } from './stripe-checkout-form';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase'; // Assuming this is your Supabase client

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

type StripePaymentSheetProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  planName: string;
  amount: number;
  userId: string;
};

export function StripePaymentSheet({ isOpen, onOpenChange, planName, amount, userId }: StripePaymentSheetProps) {
  const { toast } = useToast();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && amount > 0 && userId) {
      setLoading(true);
      // Create PaymentIntent as soon as the page loads
      fetch(`${window.location.origin}/functions/v1/create-stripe-payment-intent`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${supabase.auth.session()?.access_token}` // Pass Supabase auth token
        },
        body: JSON.stringify({ amount, planName }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            throw new Error(data.error);
          }
          setClientSecret(data.clientSecret);
        })
        .catch((error) => {
          console.error("Error fetching client secret:", error);
          toast({
            variant: "destructive",
            title: "Erro ao iniciar pagamento",
            description: error.message || "Não foi possível iniciar o processo de pagamento.",
          });
          onOpenChange(false); // Close sheet on error
        })
        .finally(() => setLoading(false));
    } else if (!isOpen) {
      setClientSecret(null); // Clear client secret when sheet closes
    }
  }, [isOpen, amount, planName, userId, toast, onOpenChange]);

  const appearance = {
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
          <SheetTitle>Assinar Plano {planName}</SheetTitle>
          <SheetDescription>
            Preencha os detalhes do seu cartão para concluir a assinatura.
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