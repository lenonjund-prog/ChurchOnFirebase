"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BadgeX } from "lucide-react"; // Substituído CrownOff por BadgeX

export default function PlanExpiredPage() {
  return (
    <div className="flex h-[calc(100vh-100px)] w-full items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="flex flex-col items-center">
          <BadgeX className="h-16 w-16 text-destructive mb-4" /> {/* Usando BadgeX */}
          <CardTitle className="text-2xl font-bold">Seu Plano Expirou!</CardTitle>
          <CardDescription>
            Parece que seu período de teste gratuito terminou ou sua assinatura não foi renovada.
            Para continuar utilizando todas as funcionalidades do ChurchOn, por favor, assine um de nossos planos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/dashboard/subscriptions">
            <Button className="w-full" size="lg">
              Ver Planos de Assinatura
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}