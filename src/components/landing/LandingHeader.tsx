"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { IgrejaSaaSLogo } from "@/components/icons";

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link className="flex items-center gap-2" href="/">
            <IgrejaSaaSLogo className="h-8 w-8 text-primary" /> {/* Aumentado de h-6 w-6 para h-8 w-8 */}
            <span className="font-bold text-xl font-headline">ChurchOn</span>
          </Link>
        </div>
        <nav className="hidden md:flex flex-1 justify-center items-center gap-6 text-sm">
          <Link className="transition-colors hover:text-primary font-bold" href="#features">
            Recursos
          </Link>
          <Link className="transition-colors hover:text-primary font-bold" href="#pricing">
            Planos
          </Link>
          <Link className="transition-colors hover:text-primary font-bold" href="#contact">
            Fale Conosco
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" className="hidden md:flex">
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild className="hidden md:flex">
            <Link href="/register">Comece Grátis</Link>
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle className="sr-only">Menu de Navegação</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-4 py-6">
                <Link className="font-bold text-lg" href="/">
                  <div className="flex items-center gap-2">
                    <IgrejaSaaSLogo className="h-8 w-8 text-primary" /> {/* Aumentado de h-6 w-6 para h-8 w-8 */}
                    <span className="font-bold text-xl font-headline">ChurchOn</span>
                  </div>
                </Link>
                <Link className="text-lg font-medium hover:text-primary" href="#features">
                  Recursos
                </Link>
                <Link className="text-lg font-medium hover:text-primary" href="#pricing">
                  Planos
                </Link>
                <Link className="text-lg font-medium hover:text-primary" href="#contact">
                  Fale Conosco
                </Link>
                <Button asChild>
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">Comece Grátis</Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}