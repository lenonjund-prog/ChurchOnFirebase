"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { IgrejaSaaSLogo } from "@/components/icons";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast"; // Corrigido: Adicionado 'from'
import { Loader2, Chrome } from "lucide-react"; // Importar o ícone Chrome para o Google
import { useSession } from "@/components/supabase-session-provider";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, loading: sessionLoading } = useSession();

  // Redirect if already logged in
  useEffect(() => {
    if (!sessionLoading && user) {
      router.push("/dashboard");
    }
  }, [sessionLoading, user, router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        throw authError;
      }

      if (data.user && !data.user.email_confirmed_at) {
        throw new Error("auth/email-not-verified");
      }

    } catch (error: any) {
      let errorMessage = "Ocorreu um erro ao fazer login.";
      if (error.message) {
        switch (error.message) {
          case 'Invalid login credentials':
            errorMessage = 'Email ou senha inválidos.';
            break;
          case 'Email not confirmed':
            errorMessage = 'Por favor, verifique seu e-mail antes de fazer login.';
            break;
          case 'auth/email-not-verified':
            errorMessage = "Por favor, verifique seu e-mail antes de fazer login. Um novo link de verificação pode ter sido enviado.";
            break;
          default:
            errorMessage = `Ocorreu um erro inesperado: ${error.message}`;
        }
      }
      
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Erro no login",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google', // Usando 'google' como provedor OAuth
        options: {
          redirectTo: `${window.location.origin}/dashboard`, // Redireciona para o dashboard após o login
        },
      });

      if (error) {
        throw error;
      }
      // O Supabase irá lidar com o redirecionamento, então nenhuma ação adicional é necessária aqui.
    } catch (error: any) {
      console.error("Erro ao entrar com Google:", error);
      setError(`Erro ao entrar com Google: ${error.message}`);
      toast({
        variant: "destructive",
        title: "Erro no login com Google",
        description: `Não foi possível fazer login com Google. ${error.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  if (sessionLoading || (!sessionLoading && user)) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className='ml-2'>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl">
          <CardHeader className="items-center text-center">
            <IgrejaSaaSLogo className="h-12 w-12 mb-2 text-primary" />
            <CardTitle className="text-2xl font-bold">ChurchOn</CardTitle>
            <CardDescription>Bem-vindo! Faça login para continuar.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input name="email" id="email" type="email" placeholder="m@example.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input name="password" id="password" type="password" required />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Entrar
              </Button>
            </form>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Ou</span>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Chrome className="h-4 w-4" />
              Entrar com Google
            </Button>
          </CardContent>
          <CardFooter className="flex-col items-center gap-4">
            <Link href="/forgot-password" className="text-sm text-muted-foreground font-semibold text-primary underline-offset-4 hover:underline">
                Esqueceu sua senha?
            </Link>
            <Separator />
            <p className="text-sm text-muted-foreground">
              Não tem uma conta?{' '}
              <Link href="/register" className="font-semibold text-primary underline-offset-4 hover:underline">
                Registre-se
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}