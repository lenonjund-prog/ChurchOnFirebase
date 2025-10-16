"use client";

import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export function PwaInitializer() {
  const { toast } = useToast();

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js')
        .then((registration) => {
          console.log('Service Worker registered with scope:', registration.scope);
          // Opcional: Notificar o usuário que a PWA está pronta para uso offline
          // toast({
          //   title: "Pronto para offline!",
          //   description: "O aplicativo agora pode ser usado offline.",
          // });
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
          toast({
            variant: "destructive",
            title: "Erro na PWA",
            description: "Não foi possível registrar o Service Worker para uso offline.",
          });
        });
    }
  }, [toast]);

  return null; // Este componente não renderiza nada visível
}