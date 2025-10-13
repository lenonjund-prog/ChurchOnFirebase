"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function BannerSection() {
  return (
    <section
      className="relative w-full h-[400px] bg-cover bg-center flex items-center justify-center text-center p-4"
      style={{ backgroundImage: `url('/Design-sem-nome-1-1.png')` }}
    >
      <div className="absolute inset-0 bg-black opacity-50"></div>
      <div className="relative z-10 text-white space-y-4">
        <h2 className="text-3xl md:text-4xl font-bold">
          Conectando Pessoas, Fortalecendo a Fé
        </h2>
        <p className="text-lg max-w-2xl mx-auto">
          Descubra como o ChurchOn pode transformar a gestão e a comunidade da sua igreja.
        </p>
        <Button asChild variant="secondary" size="lg">
          <Link href="/register">Saiba Mais</Link>
        </Button>
      </div>
    </section>
  );
}