"use client";

import Link from "next/link";
import { IgrejaSaaSLogo } from "@/components/icons";

export function LandingFooter() {
  return (
    <footer className="border-t bg-muted py-8">
      <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
        <div className="flex items-center space-x-2">
          <IgrejaSaaSLogo className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">ChurchOn</span>
        </div>
        <p className="text-center text-sm text-muted-foreground md:text-left">
          &copy; {new Date().getFullYear()} ChurchOn. Todos os direitos reservados.
        </p>
        <nav className="flex gap-4">
          <Link href="/privacy" className="text-sm text-muted-foreground hover:underline">
            Privacidade
          </Link>
          <Link href="/terms" className="text-sm text-muted-foreground hover:underline">
            Termos
          </Link>
        </nav>
      </div>
    </footer>
  );
}