"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Handshake } from "lucide-react";

export function CustomCTASection() {
  const openCrispChat = () => {
    if (typeof window !== 'undefined' && window.$crisp) {
      window.$crisp.push(['do', 'chat:open']);
    } else {
      // Fallback if Crisp is not loaded, though it should be via layout.tsx
      console.warn("Crisp chat not loaded. Cannot open chat.");
      // Optionally, redirect to mailto as a fallback
      window.location.href = "mailto:contato@churchon.com.br";
    }
  };

  return (
    <section className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="relative overflow-hidden rounded-xl h-[400px] md:h-[500px]">
          <Image
            src="/Imagem-tipos-de-sites-4-min.png"
            alt="Diversos dispositivos exibindo design de websites"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent z-10"></div>
          <div className="relative z-20 flex flex-col items-center justify-center p-8 md:p-12 lg:p-16 h-full text-center"> {/* Centralizado */}
            <div className="space-y-4 max-w-[600px]"> {/* Adicionado max-w para limitar a largura do texto */}
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-headline text-white">
                Crie o Site ou Aplicativo da Sua Igreja Conosco!
              </h2>
              <p className="text-white/90 md:text-xl/relaxed">
                Desenvolvemos soluções digitais personalizadas para atender às necessidades exclusivas da sua comunidade. Transforme a presença online da sua igreja com um site ou aplicativo feito sob medida.
              </p>
            </div>
            <div className="mt-8"> {/* Adicionado margem superior para separar do texto */}
              <Button size="lg" className="bg-white text-black hover:bg-white/90 shadow-2xl scale-105 md:scale-110" onClick={openCrispChat}>
                <Handshake className="mr-2" />Fale Conosco
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}