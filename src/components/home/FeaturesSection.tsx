"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CalendarDays, HandCoins, Megaphone, LayoutDashboard, BookOpenCheck, Receipt } from "lucide-react";

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

export function FeaturesSection() {
  return (
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
  );
}