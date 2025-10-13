"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import {
    Users,
    UserPlus,
    CalendarPlus,
    BookOpenCheck,
    HandCoins,
    Receipt,
    ArrowRight,
    Loader2,
    Calendar,
    Clock,
    User,
    MessageSquare,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Service } from '@/components/service-form';
import type { Event } from '@/components/event-form';
import { useSession } from '@/components/supabase-session-provider';

type Stats = {
    members: number;
    visitors: number;
}

export default function DashboardPage() {
    const { user, loading: sessionLoading } = useSession();
    const [latestService, setLatestService] = useState<Service | null>(null);
    const [nextEvent, setNextEvent] = useState<Event | null>(null);
    const [stats, setStats] = useState<Stats>({ members: 0, visitors: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch latest service
                const { data: serviceData, error: serviceError } = await supabase
                    .from('services')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('date_time', { ascending: false })
                    .limit(1);

                if (serviceError) console.error("Error fetching latest service:", serviceError);
                if (serviceData && serviceData.length > 0) {
                    setLatestService({
                        id: serviceData[0].id,
                        name: serviceData[0].name,
                        dateTime: serviceData[0].date_time,
                        preacher: serviceData[0].preacher,
                        theme: serviceData[0].theme,
                        observations: serviceData[0].observations,
                        presentMembers: serviceData[0].present_members,
                        presentVisitors: serviceData[0].present_visitors,
                    } as Service);
                } else {
                    setLatestService(null);
                }

                // Fetch next event
                const { data: eventData, error: eventError } = await supabase
                    .from('events')
                    .select('*')
                    .eq('user_id', user.id)
                    .gte('date_time', new Date().toISOString())
                    .order('date_time', { ascending: true })
                    .limit(1);

                if (eventError) console.error("Error fetching next event:", eventError);
                if (eventData && eventData.length > 0) {
                    setNextEvent({
                        id: eventData[0].id,
                        name: eventData[0].name,
                        dateTime: eventData[0].date_time,
                        information: eventData[0].information,
                        presentVisitors: eventData[0].present_visitors,
                    } as Event);
                } else {
                    setNextEvent(null);
                }

            } catch (error) {
                console.error("Error fetching initial data:", error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();

        // Realtime subscriptions for stats (members, visitors)
        const membersChannel = supabase
            .channel('members_dashboard_changes')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'members', filter: `user_id=eq.${user.id}` },
                payload => {
                    supabase.from('members').select('count', { count: 'exact' }).eq('user_id', user.id).then(({ count }) => {
                        setStats(prev => ({ ...prev, members: count || 0 }));
                    });
                }
            )
            .subscribe();

        const visitorsChannel = supabase
            .channel('visitors_dashboard_changes')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'visitors', filter: `user_id=eq.${user.id}` },
                payload => {
                    supabase.from('visitors').select('count', { count: 'exact' }).eq('user_id', user.id).then(({ count }) => {
                        setStats(prev => ({ ...prev, visitors: count || 0 }));
                    });
                }
            )
            .subscribe();

        // Initial fetch for counts
        supabase.from('members').select('count', { count: 'exact' }).eq('user_id', user.id).then(({ count }) => {
            setStats(prev => ({ ...prev, members: count || 0 }));
        });
        supabase.from('visitors').select('count', { count: 'exact' }).eq('user.id', user.id).then(({ count }) => {
            setStats(prev => ({ ...prev, visitors: count || 0 }));
        });


        return () => {
            membersChannel.unsubscribe();
            visitorsChannel.unsubscribe();
        };

    }, [user]);

    if (loading || sessionLoading) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className='ml-2'>Carregando seu painel...</p>
            </div>
        )
    }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Painel de Controle</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Membros</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{stats.members}</div>
                <p className="text-xs text-muted-foreground">Membros cadastrados</p>
            </CardContent>
        </Card>
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Visitantes</CardTitle>
                <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{stats.visitors}</div>
                <p className="text-xs text-muted-foreground">Visitantes registrados</p>
            </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Acesso Rápido</CardTitle>
            <CardDescription>Atalhos para as principais funcionalidades do sistema.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
             <Link href="/dashboard/members" className="w-full">
                <Button variant="outline" className="w-full h-24 flex-col gap-2">
                    <UserPlus className="h-6 w-6" />
                    <span>Adicionar Membro</span>
                </Button>
            </Link>
             <Link href="/dashboard/services" className="w-full">
                <Button variant="outline" className="w-full h-24 flex-col gap-2">
                    <BookOpenCheck className="h-6 w-6" />
                    <span>Adicionar Culto</span>
                </Button>
            </Link>
             <Link href="/dashboard/events" className="w-full">
                <Button variant="outline" className="w-full h-24 flex-col gap-2">
                    <CalendarPlus className="h-6 w-6" />
                    <span>Agendar Evento</span>
                </Button>
            </Link>
             <Link href="/dashboard/tithes-and-offerings" className="w-full">
                <Button variant="outline" className="w-full h-24 flex-col gap-2">
                    <HandCoins className="h-6 w-6" />
                    <span>Lançar Dízimo/Oferta</span>
                </Button>
            </Link>
             <Link href="/dashboard/expenses" className="w-full">
                <Button variant="outline" className="w-full h-24 flex-col gap-2">
                    <Receipt className="h-6 w-6" />
                    <span>Lançar Despesa</span>
                </Button>
            </Link>
             <Link href="/dashboard/visitors" className="w-full">
                <Button variant="outline" className="w-full h-24 flex-col gap-2">
                    <Users className="h-6 w-6" />
                    <span>Adicionar Visitante</span>
                </Button>
            </Link>
          </CardContent>
        </Card>

        {nextEvent && (
          <Card>
            <CardHeader>
              <CardTitle>Próximo Evento</CardTitle>
              <CardDescription>{nextEvent.name}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(nextEvent.dateTime).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</span>
                    </div>
                     <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{new Date(nextEvent.dateTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })}</span>
                    </div>
                </div>
                <Button asChild variant="secondary" className="w-full">
                    <Link href={`/dashboard/events/${nextEvent.id}`}>
                        <span>Ver Detalhes <ArrowRight className="ml-2 h-4 w-4" /></span>
                    </Link>
                </Button>
            </CardContent>
          </Card>
        )}
      </div>

       {latestService && (
        <Card>
            <CardHeader>
                <CardTitle>Resumo do Último Culto</CardTitle>
                <CardDescription>
                    {latestService.name} - {new Date(latestService.dateTime).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>Pregador(a): <strong>{latestService.preacher}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        <span>Tema: <strong>{latestService.theme}</strong></span>
                    </div>
                </div>
                 <Button asChild className="mt-4">
                    <Link href={`/dashboard/services/${latestService.id}`}>
                       <span>Ver Culto Completo <ArrowRight className="ml-2 h-4 w-4" /></span>
                    </Link>
                </Button>
            </CardContent>
        </Card>
      )}
      
    </div>
  );
}