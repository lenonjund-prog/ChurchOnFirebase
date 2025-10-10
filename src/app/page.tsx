"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { IgrejaSaaSLogo } from "@/components/icons";
import { Check, Users, CalendarDays, HandCoins, Megaphone, LayoutDashboard, BookOpenCheck, Receipt } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "@/components/supabase-session-provider";
import { Loader2 } from "lucide-react";
import { LandingHeader } from "@/components/landing-header";
import { LandingFooter } from "@/components/landing-footer";
// Removido import de Image, pois não será mais usado diretamente aqui para o logo

const features = [
  {
    name: "Gestão de Membros",
    description: "Registre, atualize e gerencie informações detalhadas dos membros da sua igreja.",
    icon: Users,
  },
  {
    name: "Agendamento de Eventos",
    description: "Agende e promova cultos, reuniões e eventos especiais com facilidade.",
    icon: CalendarDays,
  },
  {
    name: "Controle Financeiro",
    description: "Gerencie dízimos, ofertas e despesas para uma visão clara das finanças.",
    icon: HandCoins,
  },
  {
    name: "Comunicação Integrada",
    description: "Envie anúncios e newsletters para seus membros via e-mail ou SMS.",
    icon: Megaphone,
  },
  {
    name: "Dashboard Intuitivo",
    description: "Tenha uma visão geral das métricas chave, próximos eventos e atividades recentes.",
    icon: LayoutDashboard,
  },
  {
    name: "Controle de Frequência",
    description: "Acompanhe a participação em cultos e eventos para entender o engajamento.",
    icon: BookOpenCheck,
  },
  {
    name: "Relatórios Detalhados",
    description: "Gere relatórios financeiros, de membros e visitantes para tomadas de decisão.",
    icon: Receipt,
  },
];

const plans = [
  {
    name: 'Experimental',
    price: 'Grátis',
    period: '/ 14 dias',
    description: 'Teste todos os recursos premium gratuitamente.',
    features: ['Gestão de Membros', 'Gestão de Eventos', 'Controle Financeiro', 'Relatórios Básicos'],
    internalPlanId: 'Experimental',
  },
  {
    name: 'Mensal',
    price: 'R$ 59,90',
    period: '/ mês',
    description: 'Acesso completo a todos os recursos da plataforma.',
    features: ['Todos os recursos do plano Experimental', 'Suporte Prioritário', 'Comunicação via Email/SMS', 'Relatórios Avançados'],
    internalPlanId: 'Mensal',
  },
  {
    name: 'Anual',
    price: 'R$ 600,00',
    period: '/ ano',
    description: 'Economize com o plano anual e tenha acesso a tudo por um ano inteiro.',
    features: ['Todos os recursos do plano Mensal', 'Desconto de 2 meses', 'Acesso antecipado a novos recursos'],
    internalPlanId: 'Anual',
  },
];

export default function LandingPage() {
  const router = useRouter();
  const { user, loading: sessionLoading } = useSession();

  // Redirect if already logged in
  useEffect(() => {
    if (!sessionLoading && user) {
      router.push("/dashboard");
    }
  }, [sessionLoading, user, router]);

  // Removido o bloco de carregamento condicional.
  // A página de destino sempre renderizará seu conteúdo principal.
  // O redirecionamento será tratado pelo useEffect no cliente.

  return (
    <div className="flex min-h-screen flex-col">
      <LandingHeader />

      <main className="flex-1">
        {/* Novo Banner Section com imagem de fundo - MOVIDO PARA O TOPO */}
        <section
          className="relative w-full h-[400px] bg-cover bg-center flex items-center justify-center text-center p-4"
          style={{ backgroundImage: `url('/Design-sem-nome-1-1.png')` }}
        >
          <div className="absolute inset-0 bg-black opacity-50"></div> {/* Overlay escuro para legibilidade */}
          <div className="relative z-10 text-white space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold">
              Conectando Pessoas, Fortalecendo a Fé
            </h2>
            <p className="text-lg max-w-2xl mx-auto">
              Descubra como o ChurchOn pode transformar a gestão e a comunidade da sua igreja.
            </p>
            <Link href="#features">
              <Button variant="secondary" size="lg">
                Saiba Mais
              </Button>
            </Link>
          </div>
        </section>

        {/* Hero Section - AGORA ABAIXO DO BANNER */}
        <section className="container grid lg:grid-cols-2 place-items-center py-20 md:py-32 gap-10">
          <div className="text-center lg:text-left space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Gerencie sua Igreja com <br className="hidden md:block" />
              <span className="text-primary">Facilidade e Eficiência</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0">
              ChurchOn é a plataforma completa para a gestão da sua comunidade.
              Simplifique a administração, engaje seus membros e foque no que realmente importa.
            </p>
            <div className="flex justify-center lg:justify-start gap-4">
              <Link href="/register">
                <Button size="lg">
                  Comece Grátis
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg">
                  Já sou cliente
                </Button>
              </Link>
            </div>
          </div>
          <div className="relative w-full max-w-md aspect-square flex flex-col items-center justify-center">
            {/* Logo em destaque, menor, com o nome ChurchOn abaixo */}
            <IgrejaSaaSLogo className="h-24 w-24 mb-2" /> {/* Removido text-primary */}
            <span className="text-2xl font-bold text-primary">ChurchOn</span>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="container py-20 md:py-32 space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold">
              Recursos Poderosos para sua Igreja
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              ChurchOn oferece um conjunto robusto de ferramentas para otimizar a administração e o crescimento da sua comunidade.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="flex flex-col items-center text-center p-6">
                <feature.icon className="h-10 w-10 text-primary mb-4" />
                <CardTitle className="mb-2">{feature.name}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </Card>
            ))}
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="container py-20 md:py-32 space-y-12 bg-muted/50">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold">
              Planos de Assinatura Flexíveis
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Escolha o plano que melhor se adapta às necessidades e ao tamanho da sua igreja.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={cn('flex flex-col', {
                  'border-primary ring-2 ring-primary': plan.name === 'Anual', // Highlight Annual plan
                })}
              >
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground ml-1">{plan.period}</span>
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  <p className="font-semibold">Recursos incluídos:</p>
                  <ul className="space-y-2">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="flex-col gap-4">
                  <Link href="/register">
                    <Button className="w-full">
                      {plan.name === 'Experimental' ? 'Comece Grátis' : `Assinar ${plan.name}`}
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>

        {/* Custom App/Website CTA */}
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
            <a href="mailto:contato@churchon.com.br">
              Fale Conosco
            </a>
          </Button>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}