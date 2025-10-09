"use client";

import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Loader2 } from "lucide-react";
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import { StripeCheckoutForm } from './stripe-checkout-form';
import { useToast } from '@/hooks/use-toast';

// Certifique-se de chamar `loadStripe` fora de um componente para evitar
// recriar o objeto `Stripe` a cada renderização.
const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

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
    // Verifica se a chave publicável do Stripe está faltando quando a sheet tenta abrir
    if (isOpen && !stripePublishableKey) {
      toast({
        variant: "destructive",
        title: "Erro de Configuração",
        description: "A chave publicável do Stripe (NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) não está configurada. Por favor, verifique suas variáveis de ambiente.",
      });
      onClose(); // Fecha a sheet se a configuração estiver faltando
    }
  }, [isOpen, clientSecret, onClose, toast]);

  // Se a chave publicável estiver faltando, renderiza um estado de erro ou impede a abertura
  if (!stripePublishableKey) {
    if (isOpen) {
      return (
        <Sheet open={isOpen} onOpenChange={onClose}>
          <SheetContent className="w-full sm:max-w-2xl flex flex-col p-0">
            <SheetHeader className="p-6 pb-0">
              <SheetTitle>Erro de Configuração do Stripe</SheetTitle>
              <SheetDescription>
                A chave publicável do Stripe (NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) não está configurada. Por favor, verifique suas variáveis de ambiente.
              </SheetDescription>
            </SheetHeader>
            <div className="flex-1 flex items-center justify-center bg-background p-6">
              <p className="text-destructive">Erro: Chave publicável do Stripe ausente.</p>
            </div>
          </SheetContent>
        </Sheet>
      );
    }
    return null; // Não renderiza nada se não estiver aberta e a chave estiver faltando
  }

  const options: StripeElementsOptions = {
    clientSecret: clientSecret || undefined,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: 'hsl(var(--primary))',
        colorBackground: 'hsl(var(--background))',
        colorText: 'hsl(var(--foreground))',
        colorDanger: 'hsl(var(--destructive))',
        fontFamily: 'Inter, sans-serif',
      },
    },
  };

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
          {clientSecret && stripePromise ? (
            <Elements options={options} stripe={stripePromise}>
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