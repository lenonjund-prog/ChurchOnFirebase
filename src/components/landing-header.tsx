"use client";

import Link from "next/link";
import { IgrejaSaaSLogo } from "@/components/icons";
import { Button } from "@/components/ui/button";

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <IgrejaSaaSLogo className="h-8 w-8" /> {/* Removido text-primary */}
          <span className="font-bold text-lg">ChurchOn</span>
        </Link>
        <nav>
          <Button asChild variant="ghost">
            <Link href="/login">Login</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}