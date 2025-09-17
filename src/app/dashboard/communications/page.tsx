import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Megaphone } from "lucide-react";

export default function CommunicationsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Comunicação</h1>

      <Card>
        <CardHeader>
          <CardTitle>Ferramentas de Comunicação</CardTitle>
          <CardDescription>
            Envie anúncios e newsletters para os membros.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center text-center p-12">
            <Megaphone className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold">Funcionalidade em Desenvolvimento</h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
                As ferramentas de comunicação estão sendo desenvolvidas para permitir o envio de mensagens para os membros via email e SMS.
            </p>
        </CardContent>
      </Card>
    </div>
  );
}
