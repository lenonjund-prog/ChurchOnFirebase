"use client";

import { useState, useEffect } from "react";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Smartphone, Apple } from "lucide-react"; // Removido Android, mantido Smartphone
import { useToast } from "@/hooks/use-toast";

export default function InstallAppPage() {
  const [canInstall, setCanInstall] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Verifica se o evento deferredPrompt foi armazenado
    if (typeof window !== 'undefined' && window.deferredPrompt) {
      setCanInstall(true);
    }

    // Adiciona um listener para o caso de o evento ser disparado após o carregamento inicial
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      window.deferredPrompt = e;
      setCanInstall(true);
      console.log('beforeinstallprompt event fired and stored in InstallAppPage.');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (window.deferredPrompt) {
      // Mostra o prompt de instalação
      window.deferredPrompt.prompt();
      // Espera pela resposta do usuário
      const { outcome } = await window.deferredPrompt.userChoice;
      console.log(`User response to the install prompt: ${outcome}`);
      if (outcome === 'accepted') {
        toast({
          title: "Aplicativo Instalado!",
          description: "O ChurchOn foi adicionado à sua tela inicial.",
        });
        setCanInstall(false); // O prompt não pode ser mostrado novamente até que o app seja desinstalado
      } else {
        toast({
          variant: "destructive",
          title: "Instalação Cancelada",
          description: "Você pode tentar instalar novamente a qualquer momento.",
        });
      }
      // Limpa o prompt diferido, pois ele já foi usado
      window.deferredPrompt = null;
    } else {
      toast({
        variant: "destructive",
        title: "Instalação não disponível",
        description: "Seu navegador não suporta a instalação direta ou o prompt já foi recusado. Use as instruções abaixo.",
      });
    }
  };

  return (
    <div className="flex flex-col min-h-dvh bg-background text-foreground">
      <LandingHeader />
      <main className="flex-1 container mx-auto px-4 py-8 md:px-6 md:py-12 lg:py-16">
        <section className="mb-10 space-y-6 text-center">
          <h1 className="text-3xl md:text-4xl font-bold border-b-2 border-primary pb-4 mb-6 text-primary">
            Instale o ChurchOn como um Aplicativo!
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Adicione o ChurchOn à sua tela inicial para uma experiência de aplicativo nativo, com acesso rápido e sem a barra do navegador.
          </p>

          {canInstall && (
            <Button onClick={handleInstallClick} size="lg" className="mt-6">
              <Download className="mr-2 h-5 w-5" />
              Instalar ChurchOn
            </Button>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
            <Card className="text-left">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Apple className="h-6 w-6" />
                  No iOS (iPhone/iPad)
                </CardTitle>
                <CardDescription>
                  Siga estes passos para adicionar o ChurchOn à sua tela inicial.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                  <li>Abra o Safari e navegue até este site.</li>
                  <li>Toque no ícone de "Compartilhar" (um quadrado com uma seta para cima) na barra inferior.</li>
                  <li>Role para baixo e selecione "Adicionar à Tela de Início".</li>
                  <li>Confirme o nome e toque em "Adicionar".</li>
                </ol>
              </CardContent>
            </Card>

            <Card className="text-left">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-6 w-6" /> {/* Usando Smartphone aqui */}
                  No Android
                </CardTitle>
                <CardDescription>
                  Siga estes passos para adicionar o ChurchOn à sua tela inicial.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                  <li>Abra o Chrome e navegue até este site.</li>
                  <li>Toque no ícone de menu (três pontos verticais) no canto superior direito.</li>
                  <li>Selecione "Adicionar à tela inicial" ou "Instalar aplicativo".</li>
                  <li>Confirme o nome e toque em "Adicionar" ou "Instalar".</li>
                </ol>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <LandingFooter />
    </div>
  );
}