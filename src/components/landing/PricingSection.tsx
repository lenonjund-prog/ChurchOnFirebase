"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Check, Star } from "lucide-react";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: 'Experimental',
    price: 'Grátis',
    period: '/ 14 dias',
    description: 'Teste todos os recursos premium gratuitamente.',
    features: ['Gestão de Membros', 'Gestão de Eventos', 'Controle Financeiro', 'Relatórios Básicos'],
    buttonText: 'Comece Grátis',
    buttonVariant: 'outline',
    link: '/register',
  },
  {
    name: 'Mensal',
    price: 'R$ 59,90',
    period: '/ mês',
    description: 'Acesso completo a todos os recursos da plataforma.',
    features: ['Todos os recursos do plano Experimental', 'Suporte Prioritário', 'Relatórios Avançados'],
    buttonText: 'Assinar Mensal',
    buttonVariant: 'default',
    link: '/register', // This will redirect to subscriptions page
    isPopular: true,
  },
  {
    name: 'Anual',
    price: 'R$ 600,00',
    period: '/ ano',
    description: 'Economize com o plano anual e tenha acesso a tudo por um ano inteiro.',
    features: ['Todos os recursos do plano Mensal', 'Desconto de 2 meses', 'Acesso antecipado a novos recursos'],
    buttonText: 'Assinar Anual',
    buttonVariant: 'outline',
    link: '/register', // This will redirect to subscriptions page
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">
              Planos de Assinatura Flexíveis
            </h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Escolha o plano que melhor se adapta às necessidades e ao tamanho da sua igreja.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-sm items-start gap-8 pt-12 sm:max-w-4xl sm:grid-cols-2 md:gap-12 lg:max-w-5xl lg:grid-cols-3">
          {plans.map((plan, index) => (
            <Card
              key={plan.name}
              className={cn(
                'flex flex-col rounded-xl shadow-lg transition-all duration-300 hover:scale-105',
                plan.isPopular ? 'border-2 border-accent bg-accent/5' : 'border bg-card'
              )}
            >
              {plan.isPopular && (
                <div className="bg-accent text-accent-foreground py-1 px-4 text-sm font-semibold rounded-t-lg -mb-px flex items-center justify-center gap-1">
                  <Star className="h-4 w-4" />Popular
                </div>
              )}
              <CardHeader className="items-center text-center">
                <CardTitle className="text-2xl font-headline">{plan.name}</CardTitle>
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold tracking-tighter">{plan.price}</span>
                  <span className="text-sm font-medium text-muted-foreground">{plan.period}</span>
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="font-bold mb-3">Recursos incluídos:</p>
                <ul className="space-y-3 text-sm text-left">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full" variant={plan.buttonVariant as "default" | "outline" | "secondary" | "ghost" | "link"}>
                  <Link href={plan.link}>{plan.buttonText}</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}