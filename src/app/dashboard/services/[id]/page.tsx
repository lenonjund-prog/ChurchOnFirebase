
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { doc, onSnapshot, getDocs, collection, query, where, documentId } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, Calendar, Clock, User, MessageSquare, BookOpen, Users, HandCoins, CircleDollarSign } from 'lucide-react';
import type { Service } from '@/components/service-form';
import type { Member } from '@/components/member-form';
import type { Visitor } from '@/components/visitor-form';
import Link from 'next/link';
import type { TitheOffering } from '@/components/tithe-offering-form';

export default function ServiceDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const [user] = useAuthState(auth);
  const [service, setService] = useState<(Service & { presentVisitors?: string[] }) | null>(null);
  const [presentMembers, setPresentMembers] = useState<Member[]>([]);
  const [presentVisitors, setPresentVisitors] = useState<Visitor[]>([]);
  const [totalTithes, setTotalTithes] = useState(0);
  const [totalOfferings, setTotalOfferings] = useState(0);
  const [loading, setLoading] = useState(true);

  const serviceId = params.id as string;

  useEffect(() => {
    if (user && serviceId) {
      const serviceDocPath = `users/${user.uid}/services/${serviceId}`;
      const unsubscribe = onSnapshot(doc(db, serviceDocPath), (doc) => {
        if (doc.exists()) {
          setService({ id: doc.id, ...doc.data() } as Service & { presentVisitors?: string[] });
        } else {
          console.error("No such service!");
          setService(null);
        }
        // Keep loading true until attendance is fetched
      }, (error) => {
        console.error("Error fetching service:", error);
        setLoading(false);
      });

      return () => unsubscribe();
    } else if (!user) {
        setLoading(false);
    }
  }, [user, serviceId]);


  useEffect(() => {
    async function fetchAttendanceAndFinances() {
        if (!user || !service) return;

        try {
             // Fetch Members
             const memberIds = service.presentMembers || [];
             if (memberIds.length > 0) {
                 const membersQuery = query(collection(db, `users/${user.uid}/members`), where(documentId(), 'in', memberIds));
                 const membersSnapshot = await getDocs(membersQuery);
                 setPresentMembers(membersSnapshot.docs.map(d => ({ id: d.id, ...d.data() } as Member)));
             } else {
                 setPresentMembers([]);
             }

            // Fetch Visitors
            const visitorIds = service.presentVisitors || [];
            if (visitorIds.length > 0) {
                const visitorsQuery = query(collection(db, `users/${user.uid}/visitors`), where(documentId(), 'in', visitorIds));
                const visitorsSnapshot = await getDocs(visitorsQuery);
                setPresentVisitors(visitorsSnapshot.docs.map(d => ({ id: d.id, ...d.data() } as Visitor)));
            } else {
                setPresentVisitors([]);
            }
            
            // Fetch Finances
            const contributionsQuery = query(collection(db, `users/${user.uid}/tithes-offerings`), where('sourceId', '==', `culto_${serviceId}`));
            const contributionsSnapshot = await getDocs(contributionsQuery);
            let tithes = 0;
            let offerings = 0;
            contributionsSnapshot.forEach(doc => {
                const contribution = doc.data() as TitheOffering;
                if(contribution.type === 'Dízimo') {
                    tithes += contribution.amount;
                } else if (contribution.type === 'Oferta') {
                    offerings += contribution.amount;
                }
            });
            setTotalTithes(tithes);
            setTotalOfferings(offerings);


        } catch (error) {
            console.error("Error fetching related data: ", error);
        } finally {
            setLoading(false);
        }
    }

    if(service) {
      fetchAttendanceAndFinances();
    }

  }, [service, user, serviceId]);



  if (loading) {
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

    