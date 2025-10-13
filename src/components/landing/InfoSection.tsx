"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function InfoSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-background text-foreground">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-headline">
            Gerencie sua Igreja com Facilidade e Eficiência
          </h2>
          <p className="max-w-[600px] mx-auto text-muted-foreground md:text-xl/relaxed">
            ChurchOn é a plataforma completa para a gestão da sua comunidade. Simplifique a administração, engaje seus membros e foque no que realmente importa.
          </p>
          <div className="flex flex-col gap-2 min-[400px]:flex-row mt-4">
            <Button asChild size="lg" className="shadow-lg font-bold">
              <Link href="/register">
                Comece Grátis <ArrowRight className="ml-2" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="font-bold">
              <Link href="/login">Já sou cliente</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}