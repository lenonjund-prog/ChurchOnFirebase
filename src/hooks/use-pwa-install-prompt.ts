"use client";

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

// Declaração global para o evento beforeinstallprompt
declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
  interface BeforeInstallPromptEvent extends Event {
    readonly platforms: Array<string>;
    readonly userChoice: Promise<{
      outcome: 'accepted' | 'dismissed';
      platform: string;
    }>;
    prompt(): Promise<void>;
  }
}

export function usePwaInstallPrompt() {
  const { toast } = useToast();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handler = (e: BeforeInstallPromptEvent) => {
      e.preventDefault(); // Previne que o navegador mostre o prompt automaticamente
      console.log('[PWA] beforeinstallprompt event fired.');
      setDeferredPrompt(e);
      setIsInstallable(true);
      toast({
        title: "Aplicativo disponível!",
        description: "Você pode instalar o ChurchOn na sua tela inicial para acesso rápido.",
        duration: 5000,
      });
    };

    const handleAppInstalled = () => {
      console.log('[PWA] App installed successfully!');
      setIsInstallable(false); // Oculta o botão se o app já foi instalado
      setDeferredPrompt(null);
      toast({
        title: "ChurchOn instalado!",
        description: "O aplicativo foi adicionado à sua tela inicial.",
      });
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [toast]);

  const promptInstall = useCallback(async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt(); // Mostra o prompt de instalação do navegador
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`[PWA] User response to A2HS prompt: ${outcome}`);
      if (outcome === 'accepted') {
        setIsInstallable(false); // Oculta o botão após a aceitação
        setDeferredPrompt(null);
      }
    } else {
      toast({
        variant: "destructive",
        title: "Instalação não disponível",
        description: "O navegador não permite a instalação neste momento ou o aplicativo já está instalado.",
      });
    }
  }, [deferredPrompt, toast]);

  return { isInstallable, promptInstall };
}