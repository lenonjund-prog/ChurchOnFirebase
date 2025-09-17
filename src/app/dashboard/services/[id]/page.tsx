'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, Calendar, Clock, User, MessageSquare, BookOpen, Users, HandCoins, CircleDollarSign } from 'lucide-react';
import type { Service } from '@/components/service-form';
import type { Member } from '@/components/member-form';
import type { Visitor } from '@/components/visitor-form';
import Link from 'next/link';
import type { TitheOffering } from '@/components/tithe-offering-form';
import { useSession } from '@/components/supabase-session-provider';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js'; // Import type

export default function ServiceDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading: sessionLoading } = useSession();
  const [service, setService] = useState<(Service & { presentVisitors?: string[] }) | null>(null);
  const [presentMembers, setPresentMembers] = useState<Member[]>([]);
  const [presentVisitors, setPresentVisitors] = useState<Visitor[]>([]);
  const [totalTithes, setTotalTithes] = useState(0);
  const [totalOfferings, setTotalOfferings] = useState(0);
  const [loading, setLoading] = useState(true);

  const serviceId = params.id as string;

  useEffect(() => {
    if (!user || !serviceId) {
        setLoading(false);
        return;
    }

    const fetchService = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('services')
            .select('*')
            .eq('id', serviceId)
            .eq('user_id', user.id)
            .single();

        if (error) {
            console.error("Error fetching service:", error);
            setService(null);
        } else if (data) {
            setService({
                id: data.id,
                name: data.name,
                dateTime: data.date_time,
                preacher: data.preacher,
                theme: data.theme,
                observations: data.observations,
                presentMembers: data.present_members,
                presentVisitors: data.present_visitors,
            } as Service & { presentVisitors?: string[] });
        } else {
            setService(null);
        }
        setLoading(false);
    };

    fetchService();

    // Real-time subscription for the specific service
    const subscription = supabase
      .channel(`service_${serviceId}_changes`) // Unique channel name
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'services', filter: `id=eq.${serviceId}` },
        (payload: RealtimePostgresChangesPayload<Service>) => { // Type payload
          fetchService(); // Re-fetch on any change to this service
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, serviceId]);


  useEffect(() => {
    async function fetchAttendanceAndFinances() {
        if (!user || !service) return;

        try {
             // Fetch Members
             const memberIds = service.presentMembers || [];
             if (memberIds.length > 0) {
                 const { data: membersData, error: membersError } = await supabase
                    .from('members')
                    .select('*')
                    .eq('user_id', user.id)
                    .in('id', memberIds);

                 if (membersError) console.error("Error fetching members:", membersError);
                 setPresentMembers(membersData?.map(m => ({
                    id: m.id,
                    fullName: m.full_name,
                    phone: m.phone,
                    email: m.email,
                    address: m.address,
                    isBaptized: m.is_baptized,
                    status: m.status,
                    role: m.role,
                    joined: m.joined,
                 } as Member)) || []);
             } else {
                 setPresentMembers([]);
             }

            // Fetch Visitors
            const visitorIds = service.presentVisitors || [];
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
                .eq('source_id', `culto_${serviceId}`);

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

    if(service) {
      fetchAttendanceAndFinances();
    }

  }, [service, user, serviceId]);



  if (loading || sessionLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center text-center">
        <h2 className="text-2xl font-semibold">Culto não encontrado</h2>
        <p className="text-muted-foreground">O culto que você está procurando não existe ou foi removido.</p>
        <Button onClick={() => router.push('/dashboard/services')} className="mt-4">
          Voltar para Cultos
        </Button>
      </div>
    );
  }

  const serviceDate = new Date(service.dateTime);

  return (
    <div className="space-y-6">
        <Button variant="outline" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
        </Button>

        <Card>
            <CardHeader>
                <CardTitle className="text-3xl flex items-center gap-2">
                    {service.name}
                </CardTitle>
                <CardDescription>Detalhes do culto.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-4 lg:col-span-1">
                    <h3 className="text-lg font-semibold text-primary">Informações Gerais</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-center gap-3">
                            <Calendar className="h-4 w-4" />
                            <span>Data: {serviceDate.toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</span>
                        </li>
                         <li className="flex items-center gap-3">
                            <Clock className="h-4 w-4" />
                            <span>Horário: {serviceDate.toLocaleTimeString('pt-BR', { timeZone: 'UTC', hour: '2-digit', minute: '2-digit' })}</span>
                        </li>
                         <li className="flex items-center gap-3">
                            <User className="h-4 w-4" />
                            <span>Pregador(a): {service.preacher}</span>
                        </li>
                         <li className="flex items-center gap-3">
                            <MessageSquare className="h-4 w-4" />
                            <span>Tema: {service.theme}</span>
                        </li>
                    </ul>
                </div>
                 {service.observations && (
                    <div className="space-y-4 lg:col-span-2">
                        <h3 className="text-lg font-semibold text-primary">Observações</h3>
                        <div className="flex items-start gap-3 text-sm text-muted-foreground">
                            <BookOpen className="h-4 w-4 mt-1 flex-shrink-0" />
                            <p className="whitespace-pre-wrap">{service.observations}</p>
                        </div>
                    </div>
                )}
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
                    Lista de Presença
                 </h3>
                 <div className="grid gap-6 md:grid-cols-2">
                     <div className="space-y-2">
                         <h4 className='font-semibold'>Membros ({presentMembers.length})</h4>
                         <ul className='space-y-1 text-sm text-muted-foreground list-disc pl-5'>
                            {presentMembers.length > 0 ? (
                                presentMembers.map(m => <li key={m.id}><Link href={`/dashboard/members/${m.id}`} className='hover:underline'>{m.fullName}</Link></li>)
                            ) : (
                                <li>Nenhum membro presente.</li>
                            )}
                         </ul>
                     </div>
                      <div className="space-y-2">
                         <h4 className='font-semibold'>Visitantes ({presentVisitors.length})</h4>
                         <ul className='space-y-1 text-sm text-muted-foreground list-disc pl-5'>
                            {presentVisitors.length > 0 ? (
                                presentVisitors.map(v => <li key={v.id}><Link href={`/dashboard/visitors/${v.id}`} className='hover:underline'>{v.fullName}</Link></li>)
                            ) : (
                                <li>Nenhum visitante presente.</li>
                            )}
                         </ul>
                     </div>
                 </div>
            </CardContent>

            <CardFooter>
                 <Button onClick={() => router.push('/dashboard/services')}>Fechar Detalhes</Button>
            </CardFooter>
        </Card>
    </div>
  );
}