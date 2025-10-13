"use client";

import Link from "next/link";
import { IgrejaSaaSLogo } from "@/components/icons"; // Importar o componente da logo

export function LandingFooter() {
  return (
    <footer id="contact" className="bg-secondary text-secondary-foreground">
      <div className="container py-8 px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <IgrejaSaaSLogo className="h-6 w-6 text-primary" /> {/* Usando o componente da logo */}
            <span className="text-xl font-bold font-headline">ChurchOn</span>
          </div>
          <div className="text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} ChurchOn. Todos os direitos reservados.</p>
          </div>
          <ul className="flex gap-4 text-sm">
            <li>
              <Link className="text-muted-foreground hover:text-primary" href="/privacy">
                Privacidade
              </Link>
            </li>
            <li>
              <Link className="text-muted-foreground hover:text-primary" href="/terms">
                Termos
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}