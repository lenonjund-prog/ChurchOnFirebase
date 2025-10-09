"use client";

import React, { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

type StripeCheckoutFormProps = {
  onPaymentSuccess: () => void;
  onPaymentError: (message: string) => void;
  onSheetClose: () => void;
};

export function StripeCheckoutForm({ onPaymentSuccess, onPaymentError, onSheetClose }: StripeCheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Make sure to change this to your payment completion page
        return_url: `${window.location.origin}/dashboard/subscriptions?payment_success=true`,
      },
    });

    // This point will only be reached if there is an immediate error when
    // confirming the payment. Otherwise, your customer will be redirected to
    // your `return_url`. For some payment methods like iDEAL, your customer will
    // be redirected to an intermediate site first to authorize the payment, then
    // redirected to the `return_url`.
    if (error.type === "card_error" || error.type === "validation_error") {
      onPaymentError(error.message || "Erro no pagamento.");
      toast({
        variant: "destructive",
        title: "Erro no pagamento",
        description: error.message || "Ocorreu um erro ao processar seu pagamento.",
      });
    } else {
      onPaymentError("Ocorreu um erro inesperado.");
      toast({
        variant: "destructive",
        title: "Erro inesperado",
        description: "Ocorreu um erro inesperado. Por favor, tente novamente.",
      });
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 py-6">
      <PaymentElement id="payment-element" options={{ layout: "tabs" }} />
      <div className="flex gap-4 pt-4">
        <Button type="button" variant="outline" onClick={onSheetClose} className="w-full">
          Cancelar
        </Button>
        <Button type="submit" className="w-full" size="lg" disabled={isLoading || !stripe || !elements}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Pagar
        </Button>
      </div>
    </form>
  );
}