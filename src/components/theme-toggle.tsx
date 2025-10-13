"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase"; // Importar supabase
import { useSession } from "@/components/supabase-session-provider"; // Importar useSession
import { useToast } from "@/hooks/use-toast"; // Importar useToast

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const { user } = useSession(); // Obter o usuário da sessão
  const { toast } = useToast(); // Usar toast para feedback

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const isDarkMode = theme === "dark";

  const handleToggle = async () => {
    const newTheme = isDarkMode ? "light" : "dark";
    setTheme(newTheme); // Atualiza o tema imediatamente na UI e localStorage

    if (user) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ theme: newTheme })
          .eq('id', user.id);

        if (error) {
          throw error;
        }
        toast({
          title: "Tema atualizado!",
          description: `Seu tema foi salvo como '${newTheme}'.`,
        });
      } catch (error: any) {
        console.error("Erro ao salvar tema no perfil:", error);
        toast({
          variant: "destructive",
          title: "Erro ao salvar tema",
          description: `Não foi possível salvar sua preferência de tema. ${error.message}`,
        });
      }
    }
  };

  return (
    <div className="flex items-center justify-between space-x-2">
      <Label htmlFor="dark-mode-switch">Modo Escuro</Label>
      <Switch
        id="dark-mode-switch"
        checked={isDarkMode}
        onCheckedChange={handleToggle}
      />
    </div>
  );
}