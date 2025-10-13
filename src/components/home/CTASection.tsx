"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section className="container py-20 md:py-32 text-center space-y-8">
      <h2 className="text-3xl md:text-4xl font-bold">
        Precisa de algo mais personalizado?
      </h2>
      <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
        Se sua igreja tem necessidades específicas que vão além dos nossos planos,
        podemos desenvolver um site ou aplicativo totalmente customizado para você.
        Entre em contato para discutir suas ideias!
      </p>
      <Button asChild size="lg">
        <Link href="mailto:contato@churchon.com.br">Fale Conosco</Link>
      </Button>
    </section>
  );
}