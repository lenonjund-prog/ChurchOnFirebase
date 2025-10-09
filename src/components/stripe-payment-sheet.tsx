"use client";

import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Loader2 } from "lucide-react";
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { StripeCheckoutForm } from './stripe-checkout-form';
import { useToast } from '@/hooks/use-toast';

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

type StripePaymentSheetProps = {
  isOpen: boolean;
  onClose: () => void;
  clientSecret: string | null;
  onPaymentSuccess: () => void;
};

export function StripePaymentSheet({ isOpen, onClose, clientSecret, onPaymentSuccess }: StripePaymentSheetProps) {
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && !clientSecret) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível iniciar o pagamento. Client Secret ausente.",
      });
      onClose();
    }
  }, [isOpen, clientSecret, onClose, toast]);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-2xl flex flex-col p-0">
        <SheetHeader className="p-6 pb-0">
          <SheetTitle>Finalizar Assinatura Mensal</SheetTitle>
          <SheetDescription>
            Insira os detalhes do seu cartão para ativar o plano mensal.
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 relative overflow-hidden">
          {clientSecret ? (
            <Elements options={{ clientSecret }} stripe={stripePromise}>
              <StripeCheckoutForm onSuccess={onPaymentSuccess} onCancel={onClose} />
            </Elements>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="ml-2 text-muted-foreground">Preparando formulário de pagamento...</p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}