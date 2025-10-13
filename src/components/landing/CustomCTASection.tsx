"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Handshake } from "lucide-react";

export function CustomCTASection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-secondary/20">
      <div className="container px-4 md:px-6">
        <div className="relative overflow-hidden rounded-xl">
          <Image
            src="/Imagem-tipos-de-sites-4-min.png" // Usando a nova imagem
            alt="Diversos dispositivos exibindo design de websites"
            fill
            className="object-cover -z-10"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent"></div>
          <div className="relative grid md:grid-cols-2 gap-8 items-center justify-center p-8 md:p-12 lg:p-16">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-headline text-white">
                Crie o Site ou Aplicativo da Sua Igreja Conosco!
              </h2>
              <p className="max-w-[600px] text-white/90 md:text-xl/relaxed">
                Desenvolvemos soluções digitais personalizadas para atender às necessidades exclusivas da sua comunidade. Transforme a presença online da sua igreja com um site ou aplicativo feito sob medida.
              </p>
            </div>
            <div className="flex justify-start md:justify-end">
              <Button asChild size="lg" className="bg-white text-black hover:bg-white/90 shadow-2xl scale-105 md:scale-110">
                <Link href="mailto:contato@churchon.com.br">
                  <Handshake className="mr-2" />Fale Conosco
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}