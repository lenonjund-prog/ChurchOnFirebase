"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
// Removido o import de Image do Next.js, pois não será mais usado aqui.

export function HeroSection() {
  return (
    <section className="relative w-full h-[70vh] min-h-[500px] flex items-center justify-center text-center overflow-hidden bg-secondary"> {/* Adicionado bg-secondary para um fundo limpo */}
      {/* Removida a imagem de fundo e o overlay */}
      <div className="relative container px-4 md:px-6">
        <div className="flex flex-col justify-center space-y-6 items-center">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl font-headline text-primary-foreground">
            Gerencie sua Igreja com Facilidade e Eficiência
          </h1>
          <p className="max-w-[600px] text-white/80 md:text-xl">
            Descubra como o ChurchOn pode transformar a gestão e a comunidade da sua igreja.
          </p>
          {/* Alterado o uso de Button com asChild para Link envolvendo o Button */}
          <Link href="#features">
            <Button variant="default" size="lg">Saiba Mais</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}