
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { Badge } from "@/components/ui/badge";

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

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [user] = useAuthState(auth);
  const [churchName, setChurchName] = React.useState("");
  const [subscriptionStatus, setSubscriptionStatus] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists()) {
           const data = docSnap.data();
          if (data.churchName) {
            setChurchName(data.churchName);
          } else {
            setChurchName("Nome da Igreja");
          }

          const activePlan = data.activePlan;
          if (activePlan && activePlan !== 'Experimental') {
            setSubscriptionStatus(`Plano ${activePlan}`);
          } else if (data.createdAt) {
            const creationDate = data.createdAt.toDate();
            const today = new Date();
            const diffTime = today.getTime() - creationDate.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            const daysLeft = 14 - diffDays;
            if (daysLeft > 0) {
              setSubscriptionStatus(`Plano Grátis: ${daysLeft} dia(s) restante(s)`);
            } else {
              setSubscriptionStatus('Plano Grátis Expirado');
            }
          } else {
            // Fallback for older users without createdAt field
             setSubscriptionStatus('Plano Mensal');
          }

        } else {
          setChurchName("Nome da Igreja");
           setSubscriptionStatus('Plano Mensal');
        }
      });

      return () => unsubscribe();
    }
  }, [user]);

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
                <SidebarMenuButton asChild tooltip="Sair" className="text-destructive hover:bg-destructive/10 hover:text-destructive">
                  <Link href="/">
                    <LogOut />
                    <span>Sair</span>
                  </Link>
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
