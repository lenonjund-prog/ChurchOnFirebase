
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
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      if (!userCredential.user.emailVerified) {
        throw new Error("auth/email-not-verified");
      }

      router.push("/dashboard");

    } catch (error: any) {
      let errorMessage = "Ocorreu um erro ao fazer login.";
      if (error.code) {
        switch (error.code) {
          case 'auth/user-not-found':
          case 'auth/wrong-password':
          case 'auth/invalid-credential':
            errorMessage = 'Email ou senha inválidos.';
            break;
          case 'auth/invalid-email':
            errorMessage = 'O email fornecido não é válido.';
            break;
          default:
            errorMessage = `Ocorreu um erro inesperado: ${error.message}`;
        }
      }
      
      if (error.message === "auth/email-not-verified") {
        errorMessage = "Por favor, verifique seu e-mail antes de fazer login. Um novo link de verificação foi enviado.";
        // Optionally, resend verification email
        // await sendEmailVerification(userCredential.user);
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
