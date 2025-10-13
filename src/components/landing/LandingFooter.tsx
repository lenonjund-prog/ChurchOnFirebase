"use client";

import Link from "next/link";
import { IgrejaSaaSLogo } from "@/components/icons";

export function LandingFooter() {
  return (
    <footer id="contact" className="bg-secondary text-secondary-foreground">
      <div className="container py-8 px-4 md:px-6">
        <div className="flex flex-col items-center gap-4"> {/* Removido md:flex-row justify-between */}
          <div className="flex items-center gap-2">
            <div className="relative h-8 w-8"> {/* Wrapper div for IgrejaSaaSLogo */}
              <IgrejaSaaSLogo className="text-primary" />
            </div>
            <span className="text-xl font-bold font-headline">ChurchOn</span>
          </div>
          {/* Novo bloco para agrupar copyright e links */}
          <div className="flex flex-col items-center gap-2">
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
      </div>
    </footer>
  );
}