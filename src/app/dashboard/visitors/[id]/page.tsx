'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, User, Mail, Phone, Home, Calendar, CheckSquare, XSquare, BookUser, Presentation } from 'lucide-react';
import type { Visitor } from '@/components/visitor-form';
import { useSession } from '@/components/supabase-session-provider';

export default function VisitorProfilePage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading: sessionLoading } = useSession();
  const [visitor, setVisitor] = useState<Visitor | null>(null);
  const [sourceName, setSourceName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const visitorId = params.id as string;

  useEffect(() => {
    if (!user || !visitorId) {
        setLoading(false);
        return;
    }

    const fetchVisitor = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('visitors')
            .select('*')
            .eq('id', visitorId)
            .eq('user_id', user.id)
            .single();

        if (error) {
            console.error("Error fetching visitor:", error);
            setVisitor(null);
        } else if (data) {
            setVisitor({
                id: data.id,
                fullName: data.full_name,
                phone: data.phone,
                email: data.email,
                address: data.address,
                isChristian: data.is_christian,
                denomination: data.denomination,
                createdAt: data.created_at,
                sourceId: data.source_id,
            } as Visitor);
        } else {
            setVisitor(null);
        }
        setLoading(false);
    };

    fetchVisitor();

    // Real-time subscription for the specific visitor
    const subscription = supabase
      .from(`visitors:id=eq.${visitorId}`)
      .on('*', payload => {
        fetchVisitor(); // Re-fetch on any change to this visitor
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, visitorId]);

  useEffect(() => {
    const fetchSourceName = async () => {
      if (!user || !visitor?.sourceId) {
        setSourceName(null);
        return;
      }
      
      const [type, id] = visitor.sourceId.split('_');
      let collectionName = '';
      if (type === 'service') collectionName = 'services';
      else if (type === 'event') collectionName = 'events';
      else return;

      try {
        const { data, error } = await supabase
          .from(collectionName)
          .select('name')
          .eq('id', id)
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error("Error fetching source name:", error);
        } else if(data) {
          setSourceName(data.name);
        }
      } catch (error) {
        console.error("Error fetching source name:", error);
      }
    };
    
    fetchSourceName();
  }, [visitor, user]);

  if (loading || sessionLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!visitor) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center text-center">
        <h2 className="text-2xl font-semibold">Visitante não encontrado</h2>
        <p className="text-muted-foreground">O visitante que você está procurando não existe ou foi removido.</p>
        <Button onClick={() => router.push('/dashboard/visitors')} className="mt-4">
          Voltar para Visitantes
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
        <Button variant="outline" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
        </Button>

        <Card>
            <CardHeader>
                <CardTitle className="text-3xl flex items-center gap-2">
                    {visitor.fullName}
                </CardTitle>
                <CardDescription>Perfil detalhado do visitante.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-primary">Informações de Contato</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        {visitor.email && (
                            <li className="flex items-center gap-3">
                                <Mail className="h-4 w-4" />
                                <span>{visitor.email}</span>
                            </li>
                        )}
                         {visitor.phone && (
                            <li className="flex items-center gap-3">
                                <Phone className="h-4 w-4" />
                                <span>{visitor.phone}</span>
                            </li>
                         )}
                         {visitor.address && (
                             <li className="flex items-center gap-3">
                                <Home className="h-4 w-4" />
                                <span>{visitor.address}</span>
                            </li>
                         )}
                    </ul>
                </div>
                 <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-primary">Outras Informações</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-center gap-3">
                            <Calendar className="h-4 w-4" />
                            <span>Primeira visita em: {new Date(visitor.createdAt).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</span>
                        </li>
                        {sourceName && (
                          <li className="flex items-center gap-3">
                            <Presentation className="h-4 w-4" />
                            <span>Origem: {sourceName}</span>
                          </li>
                        )}
                        <li className="flex items-center gap-3">
                            {visitor.isChristian === 'sim' 
                                ? <CheckSquare className="h-4 w-4 text-green-600" />
                                : <XSquare className="h-4 w-4 text-destructive" />
                            }
                            <span>{visitor.isChristian === 'sim' ? 'Já é cristão' : 'Não é cristão'}</span>
                        </li>
                        {visitor.isChristian === 'sim' && visitor.denomination && (
                             <li className="flex items-center gap-3">
                                <BookUser className="h-4 w-4" />
                                <span>Denominação: {visitor.denomination}</span>
                            </li>
                        )}
                    </ul>
                </div>
            </CardContent>
            <CardFooter>
                 <Button onClick={() => router.push('/dashboard/visitors')}>Fechar Perfil</Button>
            </CardFooter>
        </Card>
    </div>
  );
}