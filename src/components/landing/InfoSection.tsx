"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { IgrejaSaaSLogo } from "@/components/icons"; // Importar a logo

export function InfoSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-background text-foreground">
      <div className="container px-4 md:px-6">
        {/* Alterado para sempre ser uma única coluna e centralizado */}
        <div className="flex flex-col items-center text-center gap-8 md:gap-12">
          {/* Logo agora é o primeiro elemento */}
          <div className="flex flex-col items-center text-center space-y-4">
            <IgrejaSaaSLogo className="h-32 w-32 md:h-48 md:w-48 text-primary" />
          </div>

          {/* Bloco de texto e botões */}
          <div className="flex flex-col items-center text-center space-y-4">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-headline">
              O que é o ChurchOn?
            </h2>
            <p className="max-w-[600px] mx-auto text-muted-foreground md:text-xl/relaxed">
              ChurchOn é uma plataforma de gerenciamento de igrejas que oferece ferramentas para simplificar a administração, otimizar a comunicação e fortalecer o engajamento da sua comunidade.
            </p>
            <div className="flex flex-col gap-2 min-[400px]:flex-row mt-4">
              <Button asChild size="lg" className="shadow-lg font-bold">
                <Link href="/register">
                  Comece Grátis <ArrowRight className="ml-2" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="font-bold">
                <Link href="/login">Já sou cliente</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}