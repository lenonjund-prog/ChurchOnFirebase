"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useSession } from "@/components/supabase-session-provider";
import { LandingHeader } from "@/components/landing-header";
import { LandingFooter } from "@/components/landing-footer";
import { HeroSection } from '@/components/home/HeroSection';
import { FeaturesSection } from '@/components/home/FeaturesSection';
import { PricingSection } from '@/components/home/PricingSection';
import { CTASection } from '@/components/home/CTASection';
import { BannerSection } from '@/components/home/BannerSection';

export default function Home() {
  const router = useRouter();
  const { user, loading: sessionLoading } = useSession();

  useEffect(() => {
    if (!sessionLoading && user) {
      router.push("/dashboard");
    }
  }, [sessionLoading, user, router]);

  if (sessionLoading || (!sessionLoading && user)) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className='ml-2'>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <LandingHeader />
      <main className="flex-1">
        <HeroSection />
        <BannerSection />
        <FeaturesSection />
        <PricingSection />
        <CTASection />
      </main>
      <LandingFooter />
    </div>
  );
}