"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative w-full h-[70vh] min-h-[500px] flex items-center justify-center text-center">
      <Image
        src="https://picsum.photos/seed/church-interior/1200/800"
        alt="Interior de uma igreja com vitrais."
        fill
        className="object-cover -z-10"
        priority
      />
      <div className="absolute inset-0 bg-black/60"></div>
      <div className="relative container px-4 md:px-6">
        <div className="flex flex-col justify-center space-y-6 items-center">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl font-headline text-primary-foreground">
            Gerencie sua Igreja com Facilidade e Eficiência
          </h1>
          <p className="max-w-[600px] text-white/80 md:text-xl">
            Descubra como o ChurchOn pode transformar a gestão e a comunidade da sua igreja.
          </p>
          <Button asChild variant="secondary" size="lg">
            <Link href="#features">Saiba Mais</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}