"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useSession } from "@/components/supabase-session-provider";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { HeroSection } from '@/components/landing/HeroSection';
import { InfoSection } from '@/components/landing/InfoSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { PricingSection } from '@/components/landing/PricingSection';
import { CustomCTASection } from '@/components/landing/CustomCTASection';

export default function Home() {
  const router = useRouter();
  const { user, loading: sessionLoading } = useSession();

  // Removido o useEffect que redirecionava usuários logados para o dashboard.
  // Agora, usuários logados podem ver a homepage.

  if (sessionLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className='ml-2'>Carregando...</p>
      </div>
    );
  }

  return (
    <div id="top" className="flex flex-col min-h-dvh bg-background">
      <LandingHeader />
      <main className="flex-1">
        <HeroSection />
        <InfoSection />
        <FeaturesSection />
        <PricingSection />
        <CustomCTASection />
      </main>
      <LandingFooter />
    </div>
  );
}