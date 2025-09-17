
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
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { collection, query, orderBy, limit, getDocs, onSnapshot, where } from 'firebase/firestore';
import type { Service } from '@/components/service-form';
import type { Event } from '@/components/event-form';

type Stats = {
    members: number;
    visitors: number;
}

export default function DashboardPage() {
    const [user] = useAuthState(auth);
    const [latestService, setLatestService] = useState<Service | null>(null);
    const [nextEvent, setNextEvent] = useState<Event | null>(null);
    const [stats, setStats] = useState<Stats>({ members: 0, visitors: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            const fetchData = async () => {
                setLoading(true);
                try {
                    // Fetch latest service
                    const servicesQuery = query(collection(db, `users/${user.uid}/services`), orderBy('dateTime', 'desc'), limit(1));
                    const serviceSnap = await getDocs(servicesQuery);
                    if (!serviceSnap.empty) {
                        setLatestService({ id: serviceSnap.docs[0].id, ...serviceSnap.docs[0].data() } as Service);
                    }

                    // Fetch next event
                    const eventsQuery = query(collection(db, `users/${user.uid}/events`), where('dateTime', '>=', new Date().toISOString()), orderBy('dateTime', 'asc'), limit(1));
                    const eventSnap = await getDocs(eventsQuery);
                    if (!eventSnap.empty) {
                        setNextEvent({ id: eventSnap.docs[0].id, ...eventSnap.docs[0].data() } as Event);
                    }
                } catch (error) {
                    console.error("Error fetching initial data:", error);
                }
            };
            
            fetchData();

            const membersUnsub = onSnapshot(collection(db, `users/${user.uid}/members`), (snap) => {
                setStats(prev => ({ ...prev, members: snap.size }));
                 setLoading(false);
            });
            const visitorsUnsub = onSnapshot(collection(db, `users/${user.uid}/visitors`), (snap) => {
                setStats(prev => ({ ...prev, visitors: snap.size }));
                 setLoading(false);
            });

             const servicesUnsub = onSnapshot(query(collection(db, `users/${user.uid}/services`), orderBy('dateTime', 'desc'), limit(1)), (snap) => {
                if (!snap.empty) setLatestService({ id: snap.docs[0].id, ...snap.docs[0].data() } as Service);
                 setLoading(false);
            });

            const eventsUnsub = onSnapshot(query(collection(db, `users/${user.uid}/events`), where('dateTime', '>=', new Date().toISOString()), orderBy('dateTime', 'asc'), limit(1)), (snap) => {
                if (!snap.empty) setNextEvent({ id: snap.docs[0].id, ...snap.docs[0].data() } as Event);
                else setNextEvent(null);
                 setLoading(false);
            });


            return () => {
                membersUnsub();
                visitorsUnsub();
                servicesUnsub();
                eventsUnsub();
            };

        } else if (!user) {
            setLoading(false);
        }
    }, [user]);

    if (loading) {
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
                        Ver Detalhes <ArrowRight className="ml-2 h-4 w-4" />
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
                       Ver Culto Completo <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </CardContent>
        </Card>
      )}
      
    </div>
  );
}

    