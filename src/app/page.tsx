"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react"; // Import useEffect
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { IgrejaSaaSLogo } from "@/components/icons";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
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
  }, [sessionLoading, user, router]); // Adicione router às dependências

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
        // If email is not confirmed, Supabase signInWithPassword might still return a user
        // but it's better to explicitly check and handle.
        // For this flow, we assume if signInWithPassword succeeds, email is confirmed
        // or the user will be redirected to a verification flow by Supabase.
        // If you need explicit email verification check, you'd implement a custom flow.
        throw new Error("auth/email-not-verified");
      }

      // Redirection is now handled by the useEffect in SessionContextProvider
      // or the useEffect above if already logged in.
      // No need for router.push here after successful login, as the auth state change
      // will trigger the SessionContextProvider's useEffect.

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
          case 'auth/email-not-verified': // Custom error for explicit check
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

  if (sessionLoading || (!sessionLoading && user)) {
    // If session is loading, show loader. If user is logged in, useEffect will handle redirect.
    // This prevents rendering the login form briefly before redirect.
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
          </CardContent>
          <CardFooter className="flex-col items-center gap-4">
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