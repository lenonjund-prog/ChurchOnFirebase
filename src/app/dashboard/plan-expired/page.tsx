"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown } from "lucide-react"; // Corrigido: CrownOff não existe, usando Crown

export default function PlanExpiredPage() {
  return (
    <div className="flex h-[calc(100vh-100px)] w-full items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="flex flex-col items-center">
          <Crown className="h-16 w-16 text-destructive mb-4" /> {/* Usando Crown */}
          <CardTitle className="text-2xl font-bold">Seu Plano Expirou!</CardTitle>
          <CardDescription>
            Parece que seu período de teste gratuito terminou ou sua assinatura não foi renovada.
            Para continuar utilizando todas as funcionalidades do ChurchOn, por favor, assine um de nossos planos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/dashboard/subscriptions" passHref>
            <Button asChild className="w-full" size="lg">
              <a>Ver Planos de Assinatura</a>
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}