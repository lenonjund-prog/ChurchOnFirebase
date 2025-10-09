"use client";

import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSession } from '@/components/supabase-session-provider';

type PagBankPaymentSheetProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  planName: string;
  amount: number;
  userId: string;
  directCheckoutUrl?: string; // Nova propriedade para link direto
};

export function PagBankPaymentSheet({ isOpen, onOpenChange, planName, amount, userId, directCheckoutUrl }: PagBankPaymentSheetProps) {
  const { toast } = useToast();
  const { session } = useSession();
  const [loading, setLoading] = useState(true);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setCheckoutUrl(null);
      return;
    }

    if (directCheckoutUrl) {
      // Se um link direto for fornecido, use-o e pule a chamada da Edge Function
      setCheckoutUrl(directCheckoutUrl);
      setLoading(false);
      return;
    }

    // Lógica existente para chamar a Edge Function
    if (amount > 0 && userId && session?.access_token) {
      setLoading(true);
      setCheckoutUrl(null); // Reset checkout URL

      const edgeFunctionUrl = `https://aivayoleogjvgpkvxmkq.supabase.co/functions/v1/create-pagbank-payment-intent`;
      console.log('Fetching PagBank checkout URL from:', edgeFunctionUrl);

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
            throw new Error(data.error);
          }
          setCheckoutUrl(data.checkoutUrl);
        })
        .catch((error) => {
          console.error("Error fetching PagBank checkout URL:", error);
          toast({
            variant: "destructive",
            title: "Erro ao iniciar pagamento PagBank",
            description: error.message || "Não foi possível iniciar o processo de pagamento com PagBank.",
          });
          onOpenChange(false);
        })
        .finally(() => setLoading(false));
    } else if (!isOpen) {
      setCheckoutUrl(null);
    }
  }, [isOpen, amount, planName, userId, toast, onOpenChange, session?.access_token, directCheckoutUrl]);

  const handleRedirectToPagBank = () => {
    if (checkoutUrl) {
      window.location.href = checkoutUrl;
    } else {
      toast({
        variant: "destructive",
        title: "Erro de redirecionamento",
        description: "URL de checkout do PagBank não disponível.",
      });
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Assinar Plano {planName} com PagBank</SheetTitle>
          <SheetDescription>
            Você será redirecionado para o PagBank para concluir sua assinatura.
          </SheetDescription>
        </SheetHeader>
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="mt-2 text-muted-foreground">Preparando o pagamento com PagBank...</p>
          </div>
        ) : (
          <div className="space-y-6 py-6">
            <p className="text-center text-muted-foreground">
              Clique no botão abaixo para ser redirecionado ao PagBank e finalizar sua compra.
            </p>
            <div className="flex gap-4 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="w-full">
                Cancelar
              </Button>
              <Button 
                type="button" 
                className="w-full" 
                size="lg" 
                onClick={handleRedirectToPagBank} 
                disabled={!checkoutUrl}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Ir para o PagBank
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}