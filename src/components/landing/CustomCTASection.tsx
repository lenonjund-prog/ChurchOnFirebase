"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Handshake } from "lucide-react";

export function CustomCTASection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32"> {/* Removido bg-secondary/20 daqui */}
      <div className="container px-4 md:px-6">
        <div className="relative overflow-hidden rounded-xl h-[400px] md:h-[500px]"> {/* Adicionada altura para o contêiner da imagem */}
          <Image
            src="/Imagem-tipos-de-sites-4-min.png" // Usando a nova imagem
            alt="Diversos dispositivos exibindo design de websites"
            fill
            className="object-cover" // Removido -z-10
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent z-10"></div> {/* Adicionado z-10 para o overlay */}
          <div className="relative z-20 grid md:grid-cols-2 gap-8 items-center justify-center p-8 md:p-12 lg:p-16 h-full"> {/* Adicionado z-20 e h-full para o conteúdo */}
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