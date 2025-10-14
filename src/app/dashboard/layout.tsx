"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  BookOpenCheck,
  CalendarDays,
  HandCoins,
  Receipt,
  FileBarChart,
  LogOut,
  Settings,
  CreditCard,
  Church,
  Loader2,
} from "lucide-react";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarFooter,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { IgrejaSaaSLogo } from "@/components/icons";
import { supabase } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { useSession } from "@/components/supabase-session-provider";
import { useToast } from "@/hooks/use-toast";
// import { useTheme } from "next-themes"; // Removido: Não solicitado pelo usuário e não relacionado ao erro atual

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/members", icon: Users, label: "Membros" },
  { href: "/dashboard/visitors", icon: UserPlus, label: "Visitantes" },
  { href: "/dashboard/services", icon: BookOpenCheck, label: "Cultos" },
  { href: "/dashboard/events", icon: CalendarDays, label: "Eventos" },
  { href: "/dashboard/tithes-and-offerings", icon: HandCoins, label: "Dízimos e Ofertas" },
  { href: "/dashboard/expenses", icon: Receipt, label: "Saídas e Despesas" },
  { href: "/dashboard/reports", icon: FileBarChart, label: "Relatórios" },
];

// Paths allowed even if the plan is expired
const allowedPathsWhenExpired = [
  "/dashboard/settings",
  "/dashboard/subscriptions",
  "/dashboard/plan-expired",
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const { session, user, loading: sessionLoading } = useSession();
  // const { setTheme, theme: currentTheme } = useTheme(); // Removido
  const [churchName, setChurchName] = React.useState("");
  const [subscriptionStatus, setSubscriptionStatus] = React.useState<string | null>(null);
  const [profileLoading, setProfileLoading] = React.useState(true);
  const [isPlanExpired, setIsPlanExpired] = React.useState(false);

  React.useEffect(() => {
    if (!sessionLoading && !user) {
      router.push("/");
    }
  }, [sessionLoading, user, router]);

  React.useEffect(() => {
    async function fetchUserProfile() {
      if (user) {
        setProfileLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('first_name, created_at, church_name, active_plan, theme')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error("Error fetching user profile:", error);
          setChurchName("Nome da Igreja");
          setSubscriptionStatus('Plano Experimental'); // Default fallback
          setIsPlanExpired(true); // Assume expired if error fetching profile
          toast({
            variant: "destructive",
            title: "Erro ao carregar perfil",
            description: "Não foi possível carregar as informações da igreja e do plano.",
          });
        } else if (data) {
          setChurchName(data.church_name || "Nome da Igreja");

          const activePlan = data.active_plan;
          let expired = false;

          if (activePlan === 'Mensal') {
            setSubscriptionStatus('Plano Mensal');
            expired = false;
          } else if (activePlan === 'Anual') {
            setSubscriptionStatus('Plano Anual');
            expired = false;
          } else { // Handle 'Experimental' or any other unexpected value
            if (data.created_at) {
              const creationDate = new Date(data.created_at);
              const today = new Date();
              const diffTime = today.getTime() - creationDate.getTime();
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              const daysLeft = 14 - diffDays;
              if (daysLeft > 0) {
                setSubscriptionStatus(`Plano Grátis: ${daysLeft} dia(s) restante(s)`);
                expired = false;
              } else {
                setSubscriptionStatus('Plano Grátis Expirado');
                expired = true; // Plan is expired
              }
            } else {
              setSubscriptionStatus('Plano Experimental'); // Fallback if no creation date
              expired = true; // Assume expired if no creation date for experimental
            }
          }
          setIsPlanExpired(expired); // Set the expiration status

          // Aplicar o tema salvo no perfil, se diferente do tema atual
          // if (data.theme && data.theme !== currentTheme) { // Removido
          //   setTheme(data.theme); // Removido
          // }
        }
        setProfileLoading(false);
      }
    }

    if (user) {
      fetchUserProfile();
    } else if (!sessionLoading) {
      setProfileLoading(false);
    }
  }, [user, sessionLoading, toast]); // Removido setTheme e currentTheme das dependências

  // Redirection logic for expired plans
  React.useEffect(() => {
    if (!sessionLoading && !profileLoading && isPlanExpired && !allowedPathsWhenExpired.includes(pathname)) {
      router.push("/dashboard/plan-expired");
    }
  }, [sessionLoading, profileLoading, isPlanExpired, pathname, router]);


  const handleSignOut = async () => {
    setProfileLoading(true); // Indicate loading during sign out

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        // Check if the error is specifically about a missing session
        if (error.message.includes('Auth session missing')) {
          console.warn("Auth session was already missing or invalid during sign out attempt. Treating as successful logout.");
          toast({
            title: "Desconectado",
            description: "Você foi desconectado com sucesso.",
          });
          router.push('/login'); // Redirecionar para login mesmo se a sessão já estava ausente
        } else {
          // Handle other types of sign-out errors
          console.error("Error signing out:", error);
          toast({
            variant: "destructive",
            title: "Erro ao sair",
            description: "Não foi possível sair. Tente novamente.",
          });
        }
      } else {
        // Successful sign out
        toast({
          title: "Desconectado",
          description: "Você foi desconectado com sucesso.",
        });
        router.push('/login'); // Redirecionar para login após logout bem-sucedido
      }
    } catch (e: any) {
      // Check if the error is specifically AuthSessionMissingError
      if (e && typeof e === 'object' && e.name === 'AuthSessionMissingError') {
        console.warn("Auth session was already missing or invalid during sign out attempt (caught in catch block). Treating as successful logout.");
        toast({
          title: "Desconectado",
          description: "Você foi desconectado com sucesso.",
        });
        router.push('/login'); // Redirecionar para login mesmo se a sessão já estava ausente
      } else {
        console.error("Unexpected error during sign out:", e);
        toast({
          variant: "destructive",
          title: "Erro inesperado ao sair",
          description: `Ocorreu um erro inesperado: ${e.message || 'Erro desconhecido.'}`,
        });
      }
    } finally {
      setProfileLoading(false);
      // O SessionContextProvider ainda lida com o redirecionamento, mas este push explícito garante a ação imediata.
    }
  };

  if (sessionLoading || profileLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className='ml-2'>Carregando seu painel...</p>
      </div>
    );
  }

  if (!user) {
    return null; // Should be redirected by useEffect
  }

  return (
    <SidebarProvider>
      <Sidebar variant="inset">
        <SidebarHeader>
          <div className="flex items-center justify-center gap-2">
            <IgrejaSaaSLogo className="size-8 text-sidebar-primary" />
            <span className="text-lg font-semibold text-sidebar-foreground">
              ChurchOn
            </span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`))}
                  tooltip={item.label}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
           <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Configurações" isActive={pathname === '/dashboard/settings'}>
                  <Link href="/dashboard/settings">
                    <Settings />
                    <span>Configurações</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Assinaturas" isActive={pathname === '/dashboard/subscriptions'}>
                  <Link href="/dashboard/subscriptions">
                    <CreditCard />
                    <span>Assinaturas</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleSignOut} tooltip="Sair" className="text-destructive hover:bg-destructive/10 hover:text-destructive">
                  <LogOut />
                  <span>Sair</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center justify-between gap-4 border-b bg-card/50 px-6 backdrop-blur-sm">
          <SidebarTrigger className="md:hidden" />
           <div className="flex-1 flex items-center justify-center gap-2">
             <Church className="h-5 w-5 text-muted-foreground" />
             <span className="text-xl font-semibold">{churchName}</span>
          </div>
          {subscriptionStatus && (
            <Badge variant="premium">⭐ {subscriptionStatus}</Badge>
          )}
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}