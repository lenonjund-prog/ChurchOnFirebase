"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
// Removido o import de IgrejaSaaSLogo, pois não é mais usado aqui.

export function HeroSection() {
  return (
    <section className="container grid lg:grid-cols-2 place-items-center py-20 md:py-32 gap-10">
      <div className="text-center lg:text-left space-y-6">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
          Gerencie sua Igreja com <br className="hidden md:block" />
          <span className="text-primary">Facilidade e Eficiência</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0">
          ChurchOn é a plataforma completa para a gestão da sua comunidade.
          Simplifique a administração, engaje seus membros e foque no que realmente importa.
        </p>
        <div className="flex justify-center lg:justify-start gap-4">
          <Button asChild size="lg">
            <Link href="/register"><span>Comece Grátis</span></Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/login"><span>Já sou cliente</span></Link>
          </Button>
        </div>
      </div>
      <div className="relative w-full max-w-md aspect-square flex flex-col items-center justify-center">
        {/* IgrejaSaaSLogo removida daqui */}
        <span className="text-2xl font-bold text-primary">ChurchOn</span>
      </div>
    </section>
  );
}