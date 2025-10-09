"use client";

import React, { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type StripeCheckoutFormProps = {
  onSuccess: () => void;
  onCancel: () => void;
};

export function StripeCheckoutForm({ onSuccess, onCancel }: StripeCheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
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
        return_url: `${window.location.origin}/dashboard/subscriptions?payment_status=success`,
      },
      redirect: 'if_required', // Handle redirection manually if needed
    });

    // This point will only be reached if there is an immediate error when
    // confirming the payment. Otherwise, your customer will be redirected to
    // your `return_url`.
    if (error) {
      if (error.type === "card_error" || error.type === "validation_error") {
        toast({
          variant: "destructive",
          title: "Erro no pagamento",
          description: error.message,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Erro inesperado",
          description: "Ocorreu um erro inesperado. Por favor, tente novamente.",
        });
      }
      setIsLoading(false);
    } else {
      // Payment succeeded, but no redirect happened (e.g., 3D Secure not required)
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6">
      <PaymentElement />
      <div className="flex gap-4 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="w-full">
          Cancelar
        </Button>
        <Button type="submit" className="w-full" size="lg" disabled={isLoading || !stripe || !elements}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Confirmar Assinatura
        </Button>
      </div>
    </form>
  );
}