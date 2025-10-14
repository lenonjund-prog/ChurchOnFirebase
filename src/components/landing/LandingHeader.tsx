"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { IgrejaSaaSLogo } from "@/components/icons";
import React from "react"; // Import React for Fragment

export function LandingHeader() {
  const openCrispChat = () => {
    if (typeof window !== 'undefined' && window.$crisp) {
      window.$crisp.push(['do', 'chat:open']);
    } else {
      console.warn("Crisp chat not loaded. Cannot open chat.");
      window.location.href = "mailto:contato@churchon.com.br";
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2">
          <Link className="flex items-center gap-2" href="/">
            <IgrejaSaaSLogo className="h-8 w-8 text-primary" />
            <span className="font-bold text-xl font-headline">ChurchOn</span>
          </Link>
        </div>
        <nav className="hidden md:flex flex-1 justify-center items-center gap-6 text-base">
          <Button asChild variant="ghost" className="font-bold transition-transform hover:scale-105 hover:text-primary">
            <Link href="/#top">
              Início
            </Link>
          </Button>
          <Button asChild variant="ghost" className="font-bold transition-transform hover:scale-105 hover:text-primary">
            <Link href="#features">
              Recursos
            </Link>
          </Button>
          <Button asChild variant="ghost" className="font-bold transition-transform hover:scale-105 hover:text-primary">
            <Link href="#pricing">
              Planos
            </Link>
          </Button>
          <Button asChild variant="ghost" className="font-bold transition-transform hover:scale-105 hover:text-primary">
            <Link href="/#custom-cta">Crie seu site ou app</Link>
          </Button>
          <Button variant="ghost" className="font-bold transition-transform hover:scale-105 hover:text-primary" onClick={openCrispChat}>
            Fale Conosco
          </Button>
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" className="hidden md:flex text-base transition-all hover:scale-105 hover:shadow-lg hover:shadow-primary/20">
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild className="hidden md:flex text-base transition-all hover:scale-105 hover:shadow-lg hover:shadow-primary/20">
            <Link href="/register">Comece Grátis</Link>
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden" aria-label="Toggle navigation menu">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle className="sr-only">Menu de Navegação</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-4 py-6 items-end"> {/* Removido items-center e text-center, adicionado items-end */}
                <Link className="font-bold text-lg w-full flex items-center justify-end gap-2" href="/"> {/* Ajustado para justify-end */}
                  <React.Fragment>
                    <IgrejaSaaSLogo className="h-8 w-8 text-primary" />
                    <span className="font-bold text-xl font-headline">ChurchOn</span>
                  </React.Fragment>
                </Link>
                <Button asChild variant="ghost" className="w-full text-lg font-medium hover:text-primary justify-end"> {/* Ajustado para justify-end */}
                  <Link href="/#top">
                    Início
                  </Link>
                </Button>
                <Button asChild variant="ghost" className="w-full text-lg font-medium hover:text-primary justify-end"> {/* Ajustado para justify-end */}
                  <Link href="#features">
                    Recursos
                  </Link>
                </Button>
                <Button asChild variant="ghost" className="w-full text-lg font-medium hover:text-primary justify-end"> {/* Ajustado para justify-end */}
                  <Link href="#pricing">
                    Planos
                  </Link>
                </Button>
                <Button asChild variant="ghost" className="w-full text-lg font-medium hover:text-primary justify-end px-0"> {/* Ajustado para justify-end */}
                  <Link href="/#custom-cta">Crie seu site ou app</Link>
                </Button>
                <Button variant="ghost" className="w-full text-lg font-medium hover:text-primary justify-end px-0" onClick={openCrispChat}> {/* Ajustado para justify-end */}
                  Fale Conosco
                </Button>
                <Button asChild className="w-full justify-end"> {/* Ajustado para justify-end */}
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild className="w-full justify-end"> {/* Ajustado para justify-end */}
                  <Link href="/register">Comece Grátis</Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}