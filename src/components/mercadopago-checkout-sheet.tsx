"use client";

import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Loader2 } from "lucide-react";

type MercadoPagoCheckoutSheetProps = {
  isOpen: boolean;
  onClose: () => void;
  checkoutUrl: string | null;
};

export function MercadoPagoCheckoutSheet({ isOpen, onClose, checkoutUrl }: MercadoPagoCheckoutSheetProps) {
  const [iframeLoading, setIframeLoading] = useState(true);

  const handleIframeLoad = () => {
    setIframeLoading(false);
  };

  React.useEffect(() => {
    if (isOpen) {
      setIframeLoading(true); // Reset loading state when sheet opens
    }
  }, [isOpen]);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-2xl flex flex-col p-0">
        <SheetHeader className="p-6 pb-0">
          <SheetTitle>Finalizar Assinatura</SheetTitle>
          <SheetDescription>
            Você será redirecionado para o ambiente seguro do Mercado Pago para concluir sua assinatura.
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 relative overflow-hidden">
          {iframeLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="ml-2 text-muted-foreground">Carregando pagamento...</p>
            </div>
          )}
          {checkoutUrl && (
            <iframe
              src={checkoutUrl}
              onLoad={handleIframeLoad}
              className="w-full h-full border-none"
              title="Mercado Pago Checkout"
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}