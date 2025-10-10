"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
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

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, loading: sessionLoading } = useSession();

  // Redirect if already logged in
  if (!sessionLoading && user) {
    router.push("/dashboard");
    return null;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const churchName = formData.get("churchName") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      toast({
        variant: "destructive",
        title: "Erro no registro",
        description: "As senhas não coincidem.",
      });
      setLoading(false);
      return;
    }

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            church_name: churchName, // Pass church_name to raw_user_meta_data
            phone: phone,
          },
        },
      });

      if (authError) {
        throw authError;
      }

      // The 'profiles' table is now handled by a trigger on auth.users insert,
      // which includes church_name from raw_user_meta_data.
      // No need to manually update a 'users' table here.

      toast({
        title: "Registro quase concluído!",
        description: "Enviamos um e-mail de verificação. Por favor, confirme seu e-mail antes de fazer login.",
      });
      
      router.push("/login"); // Redirect to the new login page

    } catch (error: any) {
      let errorMessage = "Ocorreu um erro ao criar a conta.";
      if (error.message) {
        switch (error.message) {
          case 'User already registered':
            errorMessage = 'Este email já está em uso.';
            break;
          case 'Password should be at least 6 characters':
            errorMessage = 'A senha deve ter pelo menos 6 caracteres.';
            break;
          case 'AuthApiError: Email link is invalid or has expired':
            errorMessage = 'O email fornecido não é válido.';
            break;
          default:
            errorMessage = `Ocorreu um erro inesperado: ${error.message}`;
        }
      }
      
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Erro no registro",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  if (sessionLoading) {
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
            <CardDescription>Crie sua conta para começar a gerenciar sua igreja.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Nome</Label>
                  <Input name="firstName" id="firstName" type="text" placeholder="Seu nome" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Sobrenome</Label>
                  <Input name="lastName" id="lastName" type="text" placeholder="Seu sobrenome" required />
                </div>
              </div>
               <div className="space-y-2">
                <Label htmlFor="churchName">Nome da Igreja</Label>
                <Input name="churchName" id="churchName" type="text" placeholder="Nome da sua igreja" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input name="email" id="email" type="email" placeholder="m@example.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input name="phone" id="phone" type="tel" placeholder="(11) 99999-9999" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input name="password" id="password" type="password" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmação de Senha</Label>
                <Input name="confirmPassword" id="confirmPassword" type="password" required />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Registrar
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex-col items-center gap-4">
            <Separator />
            <p className="text-sm text-muted-foreground">
              Já tem uma conta?{' '}
              <Link href="/login" className="font-semibold text-primary underline-offset-4 hover:underline">
                Entre
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}