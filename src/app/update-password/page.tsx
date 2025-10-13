"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { IgrejaSaaSLogo } from "@/components/icons";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Lock } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const formSchema = z.object({
  password: z.string().min(6, { message: "A senha deve ter pelo menos 6 caracteres." }),
  confirmPassword: z.string().min(6, { message: "A confirmação de senha é obrigatória." }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem.",
  path: ["confirmPassword"],
});

type FormValues = z.infer<typeof formSchema>;

export default function UpdatePasswordPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  // Check if there's an access_token in the URL hash, which indicates a password reset flow
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' && session?.access_token) {
        // User has clicked the reset link and is now in a password recovery state
        // The session object should contain the access_token
        // No explicit action needed here, just ensuring the state is recognized
      } else if (event === 'SIGNED_IN' && session) {
        // If the user somehow gets signed in (e.g., after setting new password), redirect to dashboard
        router.push('/dashboard');
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);


  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (error) {
        throw error;
      }

      setMessage("Sua senha foi redefinida com sucesso! Você pode fazer login agora.");
      toast({
        title: "Senha redefinida!",
        description: "Sua senha foi atualizada com sucesso.",
      });
      form.reset(); // Clear the form
      router.push('/login'); // Redirect to the new login page

    } catch (error: any) {
      console.error("Error updating password:", error);
      let errorMessage = "Ocorreu um erro ao redefinir sua senha.";
      if (error.message) {
        errorMessage = `Erro: ${error.message}`;
      }
      toast({
        variant: "destructive",
        title: "Erro ao redefinir senha",
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
            <IgrejaSaaSLogo className="h-12 w-12 mb-2 text-primary" src="/logo.png" alt="ChurchOn Logo" />
            <CardTitle className="text-2xl font-bold">Definir Nova Senha</CardTitle>
            <CardDescription>
              Insira e confirme sua nova senha.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="password">Nova Senha</FormLabel>
                      <FormControl>
                        <Input id="password" type="password" placeholder="********" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="confirmPassword">Confirmar Nova Senha</FormLabel>
                      <FormControl>
                        <Input id="confirmPassword" type="password" placeholder="********" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {message && <p className="text-sm text-green-600">{message}</p>}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Redefinir Senha
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex-col items-center gap-4">
            <Separator />
            <p className="text-sm text-muted-foreground">
              <Link href="/login" className="font-semibold text-primary underline-offset-4 hover:underline">
                Voltar para o Login
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}