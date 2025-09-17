'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, Calendar, Clock, Info, Users, HandCoins, CircleDollarSign } from 'lucide-react';
import type { Event } from '@/components/event-form';
import type { Visitor } from '@/components/visitor-form';
import Link from 'next/link';
import type { TitheOffering } from '@/components/tithe-offering-form';
import { useSession } from '@/components/supabase-session-provider';

export default function EventDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading: sessionLoading } = useSession();
  const [event, setEvent] = useState<Event | null>(null);
  const [presentVisitors, setPresentVisitors] = useState<Visitor[]>([]);
  const [totalTithes, setTotalTithes] = useState(0);
  const [totalOfferings, setTotalOfferings] = useState(0);
  const [loading, setLoading] = useState(true);

  const eventId = params.id as string;

  useEffect(() => {
    if (!user || !eventId) {
        setLoading(false);
        return;
    }

    const fetchEvent = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('events')
            .select('*')
            .eq('id', eventId)
            .eq('user_id', user.id)
            .single();

        if (error) {
            console.error("Error fetching event:", error);
            setEvent(null);
        } else if (data) {
            setEvent({
                id: data.id,
                name: data.name,
                dateTime: data.date_time,
                information: data.information,
                presentVisitors: data.present_visitors,
            } as Event);
        } else {
            setEvent(null);
        }
        setLoading(false); // Set loading to false after initial fetch
    };

    fetchEvent();

    // Real-time subscription for the specific event
    const subscription = supabase
      .from(`events:id=eq.${eventId}`)
      .on('*', payload => {
        fetchEvent(); // Re-fetch on any change to this event
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, eventId]);

  useEffect(() => {
    async function fetchRelatedData() {
        if (!user || !event) return;

        try {
            // Fetch Visitors
            const visitorIds = event.presentVisitors || [];
            if (visitorIds.length > 0) {
                const { data: visitorsData, error: visitorsError } = await supabase
                    .from('visitors')
                    .select('*')
                    .eq('user_id', user.id)
                    .in('id', visitorIds);

                if (visitorsError) console.error("Error fetching visitors:", visitorsError);
                setPresentVisitors(visitorsData?.map(v => ({
                    id: v.id,
                    fullName: v.full_name,
                    phone: v.phone,
                    email: v.email,
                    address: v.address,
                    isChristian: v.is_christian,
                    denomination: v.denomination,
                    createdAt: v.created_at,
                    sourceId: v.source_id,
                } as Visitor)) || []);
            } else {
                setPresentVisitors([]);
            }

            // Fetch Finances
            const { data: contributionsData, error: contributionsError } = await supabase
                .from('tithes_offerings')
                .select('type, amount')
                .eq('user_id', user.id)
                .eq('source_id', `evento_${eventId}`);

            if (contributionsError) console.error("Error fetching contributions:", contributionsError);

            let tithes = 0;
            let offerings = 0;
            contributionsData?.forEach(c => {
                if(c.type === 'Dízimo') {
                    tithes += c.amount;
                } else if (c.type === 'Oferta') {
                    offerings += c.amount;
                }
            });
            setTotalTithes(tithes);
            setTotalOfferings(offerings);

        } catch (error) {
            console.error("Error fetching related data: ", error);
        }
    }

    if(event) {
      fetchRelatedData();
    }
  }, [event, user, eventId]);


  if (loading || sessionLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center text-center">
        <h2 className="text-2xl font-semibold">Evento não encontrado</h2>
        <p className="text-muted-foreground">O evento que você está procurando não existe ou foi removido.</p>
        <Button onClick={() => router.push('/dashboard/events')} className="mt-4">
          Voltar para Eventos
        </Button>
      </div>
    );
  }
  
  const eventDate = new Date(event.dateTime);

  return (
    <div className="space-y-6">
        <Button variant="outline" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
        </Button>

        <Card>
            <CardHeader>
                <CardTitle className="text-3xl flex items-center gap-2">
                    {event.name}
                </CardTitle>
                <CardDescription>Detalhes do evento.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-primary">Informações Gerais</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-center gap-3">
                            <Calendar className="h-4 w-4" />
                            <span>Data: {eventDate.toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</span>
                        </li>
                         <li className="flex items-center gap-3">
                            <Clock className="h-4 w-4" />
                            <span>Horário: {eventDate.toLocaleTimeString('pt-BR', { timeZone: 'UTC', hour: '2-digit', minute: '2-digit' })}</span>
                        </li>
                         {event.information && (
                            <li className="flex items-start gap-3">
                                <Info className="h-4 w-4 mt-1 flex-shrink-0" />
                                <p className="whitespace-pre-wrap">{event.information}</p>
                            </li>
                         )}
                    </ul>
                </div>
            </CardContent>

             <CardContent>
                <h3 className="text-lg font-semibold text-primary mb-4">Financeiro</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-3 rounded-lg border p-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                           <HandCoins className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-muted-foreground">Total de Dízimos</p>
                            <p className="font-bold text-lg">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalTithes)}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg border p-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                            <CircleDollarSign className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-muted-foreground">Total de Ofertas</p>
                            <p className="font-bold text-lg">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalOfferings)}</p>
                        </div>
                    </div>
                 </div>
            </CardContent>

             <CardContent>
                 <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                    <Users className='h-5 w-5' />
                    Visitantes Presentes
                 </h3>
                 <div className="space-y-2">
                     <ul className='space-y-1 text-sm text-muted-foreground list-disc pl-5'>
                        {presentVisitors.length > 0 ? (
                            presentVisitors.map(v => <li key={v.id}><Link href={`/dashboard/visitors/${v.id}`} className='hover:underline'>{v.fullName}</Link></li>)
                        ) : (
                            <li>Nenhum visitante presente neste evento.</li>
                        )}
                     </ul>
                 </div>
            </CardContent>

            <CardFooter>
                 <Button onClick={() => router.push('/dashboard/events')}>Fechar Detalhes</Button>
            </CardFooter>
        </Card>
    </div>
  );
}