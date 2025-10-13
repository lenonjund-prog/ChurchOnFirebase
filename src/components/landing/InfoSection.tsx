"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { IgrejaSaaSLogo } from "@/components/icons"; // Importar a logo

export function InfoSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-background text-foreground">
      <div className="container px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-8 md:gap-12">
          {/* Lado Esquerdo: Logo - Centralizado */}
          <div className="flex flex-col items-center text-center space-y-4">
            {/* Div wrapper para a logo com 'fill', definindo seu tamanho e posição relativa */}
            <div className="relative h-48 w-48 md:h-64 md:w-64 lg:h-80 lg:w-80"> {/* Aumentado o tamanho da logo */}
              <IgrejaSaaSLogo className="object-contain" /> {/* object-contain para garantir que a logo não seja cortada */}
            </div>
            {/* Removido o span com o nome 'ChurchOn' que estava aqui */}
          </div>

          {/* Lado Direito: Título, Descrição e Botões - Centralizado */}
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
                  <span>Comece Grátis <ArrowRight className="ml-2" /></span>
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="font-bold">
                <Link href="/login"><span>Já sou cliente</span></Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}