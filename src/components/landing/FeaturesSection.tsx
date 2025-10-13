"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, DollarSign, LayoutDashboard, UserCheck, ChartNoAxesColumnIncreasing } from "lucide-react";

const features = [
  {
    name: "Gestão de Membros",
    description: "Registre, atualize e gerencie informações detalhadas dos membros da sua igreja.",
    icon: Users,
  },
  {
    name: "Agendamento de Eventos",
    description: "Agende e promova cultos, reuniões e eventos especiais com facilidade.",
    icon: Calendar,
  },
  {
    name: "Controle Financeiro",
    description: "Gerencie dízimos, ofertas e despesas para uma visão clara das finanças.",
    icon: DollarSign,
  },
  {
    name: "Dashboard Intuitivo",
    description: "Tenha uma visão geral das métricas chave, próximos eventos e atividades recentes.",
    icon: LayoutDashboard,
  },
  {
    name: "Controle de Frequência",
    description: "Acompanhe a participação em cultos e eventos para entender o engajamento.",
    icon: UserCheck,
  },
  {
    name: "Relatórios Detalhados",
    description: "Gere relatórios financeiros, de membros e visitantes para tomadas de decisão.",
    icon: ChartNoAxesColumnIncreasing,
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-foreground text-background">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">
              Recursos Poderosos para sua Igreja
            </h2>
            <p className="max-w-[900px] text-background/70 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              ChurchOn oferece um conjunto robusto de ferramentas para otimizar a administração e o crescimento da sua comunidade.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-sm items-start gap-8 pt-12 sm:max-w-5xl md:grid-cols-2 lg:max-w-none lg:grid-cols-3">
          {features.map((feature, index) => (
            <Card key={index} className="bg-background/5 border-border/20 hover:border-primary/50 hover:bg-background/10 transition-all hover:scale-105 duration-300 shadow-md flex flex-col">
              <CardHeader>
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 border-4 border-primary/20">
                  <feature.icon className="w-8 h-8 text-primary-foreground" />
                </div>
                <CardTitle className="font-headline text-xl text-background">{feature.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="text-sm text-background/70">{feature.description}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}