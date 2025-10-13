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
            src="https://picsum.photos/seed/worship-praise/1200/600"
            alt="Silhueta de pessoa com a mão levantada em um culto de adoração."
            fill
            className="object-cover -z-10"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent"></div>
          <div className="relative grid md:grid-cols-2 gap-8 items-center justify-center p-8 md:p-12 lg:p-16">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-headline text-white">
                Precisa de algo mais personalizado?
              </h2>
              <p className="max-w-[600px] text-white/90 md:text-xl/relaxed">
                Se sua igreja tem necessidades específicas que vão além dos nossos planos, podemos desenvolver um site ou aplicativo totalmente customizado para você. Entre em contato para discutir suas ideias!
              </p>
            </div>
            <div className="flex justify-start md:justify-end">
              <Button asChild size="lg" className="bg-white text-black hover:bg-white/90 shadow-2xl scale-105 md:scale-110">
                <Link href="mailto:contato@churchon.com.br">
                  <span><Handshake className="mr-2" />Fale Conosco</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}