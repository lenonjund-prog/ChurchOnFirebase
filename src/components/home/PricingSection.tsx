"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

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

export function PricingSection() {
  return (
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
              'border-primary ring-2 ring-primary': plan.name === 'Anual',
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
              <Button asChild className="w-full">
                <Link href="/register">
                  {plan.name === 'Experimental' ? 'Comece Grátis' : `Assinar ${plan.name}`}
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  );
}