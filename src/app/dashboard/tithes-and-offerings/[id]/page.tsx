'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, User, HandCoins, Calendar, CircleDollarSign, Landmark, Presentation, Info } from 'lucide-react';
import type { TitheOffering } from '@/components/tithe-offering-form';
import { useSession } from '@/components/supabase-session-provider';

export default function ContributionDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading: sessionLoading } = useSession();
  const [contribution, setContribution] = useState<TitheOffering | null>(null);
  const [contributorName, setContributorName] = useState<string | null>(null);
  const [sourceName, setSourceName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const contributionId = params.id as string;

  useEffect(() => {
    if (!user || !contributionId) {
        setLoading(false);
        return;
    }

    const fetchContribution = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('tithes_offerings')
            .select('*')
            .eq('id', contributionId)
            .eq('user_id', user.id)
            .single();

        if (error) {
            console.error("Error fetching contribution:", error);
            setContribution(null);
        } else if (data) {
            setContribution({
                id: data.id,
                memberId: data.member_id,
                type: data.type,
                amount: data.amount,
                date: data.date,
                method: data.method,
                observations: data.observations,
                sourceId: data.source_id,
            } as TitheOffering);
        } else {
            setContribution(null);
        }
        setLoading(false);
    };

    fetchContribution();

    // Real-time subscription for the specific contribution
    const subscription = supabase
      .from(`tithes_offerings:id=eq.${contributionId}`)
      .on('*', payload => {
        fetchContribution(); // Re-fetch on any change to this contribution
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, contributionId]);

  useEffect(() => {
    const fetchRelatedNames = async () => {
      if (!user || !contribution) {
        setLoading(false);
        return
      };

      // Fetch Contributor Name
      if (contribution.memberId === 'anonimo') {
        setContributorName('Anônimo');
      } else if (contribution.memberId) {
        // Try to find in members
        const { data: memberData, error: memberError } = await supabase
            .from('members')
            .select('full_name')
            .eq('id', contribution.memberId)
            .eq('user_id', user.id)
            .single();

        if (memberError && memberError.code !== 'PGRST116') { // PGRST116 means no rows found
            console.error("Error fetching member:", memberError);
        }

        if (memberData) {
            setContributorName(`${memberData.full_name} (Membro)`);
        } else {
            // If not found in members, try visitors
            const { data: visitorData, error: visitorError } = await supabase
                .from('visitors')
                .select('full_name')
                .eq('id', contribution.memberId)
                .eq('user_id', user.id)
                .single();

            if (visitorError && visitorError.code !== 'PGRST116') {
                console.error("Error fetching visitor:", visitorError);
            }

            if (visitorData) {
                setContributorName(`${visitorData.full_name} (Visitante)`);
            } else {
                setContributorName('Contribuinte desconhecido');
            }
        }
      } else {
         setContributorName('Contribuinte não especificado');
      }

      // Fetch Source Name
      if (contribution.sourceId) {
        const [type, id] = contribution.sourceId.split('_');
        let collectionName = '';
        if (type === 'culto') collectionName = 'services';
        else if (type === 'evento') collectionName = 'events';
        else {
            setSourceName('N/A');
        }

        if (collectionName) {
            try {
              const { data: sourceData, error: sourceError } = await supabase
                .from(collectionName)
                .select('name')
                .eq('id', id)
                .eq('user_id', user.id)
                .single();

              if (sourceError && sourceError.code !== 'PGRST116') {
                console.error("Error fetching source name:", sourceError);
              }

              if(sourceData) {
                setSourceName(`${sourceData.name} (${type.charAt(0).toUpperCase() + type.slice(1)})`);
              } else {
                 setSourceName('Origem removida');
              }
            } catch (error) {
              console.error("Error fetching source name:", error);
              setSourceName('Erro ao buscar origem');
            }
        }
      } else {
        setSourceName('N/A');
      }
      setLoading(false);
    };
    
    if (contribution) {
      fetchRelatedNames();
    } else {
      setLoading(false);
    }
  }, [contribution, user]);

  if (loading || sessionLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!contribution) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center text-center">
        <h2 className="text-2xl font-semibold">Contribuição não encontrada</h2>
        <p className="text-muted-foreground">O registro que você está procurando não existe ou foi removido.</p>
        <Button onClick={() => router.push('/dashboard/tithes-and-offerings')} className="mt-4">
          Voltar para Dízimos e Ofertas
        </Button>
      </div>
    );
  }

  const contributionDate = new Date(contribution.date);

  return (
    <div className="space-y-6">
        <Button variant="outline" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
        </Button>

        <Card>
            <CardHeader>
                <CardTitle className="text-3xl flex items-center gap-2">
                   Detalhes da Contribuição
                </CardTitle>
                <CardDescription>
                    Registro de {contribution.type} de {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(contribution.amount)}.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-primary">Informações do Registro</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-center gap-3">
                            <User className="h-4 w-4" />
                            <span>Contribuinte: {contributorName || 'Carregando...'}</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <HandCoins className="h-4 w-4" />
                            <span>Tipo: {contribution.type}</span>
                        </li>
                         <li className="flex items-center gap-3">
                            <CircleDollarSign className="h-4 w-4" />
                            <span>Valor: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(contribution.amount)}</span>
                        </li>
                         <li className="flex items-center gap-3">
                            <Calendar className="h-4 w-4" />
                            <span>Data: {contributionDate.toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</span>
                        </li>
                         <li className="flex items-center gap-3">
                            <Landmark className="h-4 w-4" />
                            <span>Método: {contribution.method}</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <Presentation className="h-4 w-4" />
                            <span>Origem: {sourceName || 'Carregando...'}</span>
                        </li>
                         {contribution.observations && (
                            <li className="flex items-start gap-3">
                                <Info className="h-4 w-4 mt-1 flex-shrink-0" />
                                <p className="whitespace-pre-wrap">{contribution.observations}</p>
                            </li>
                         )}
                    </ul>
                </div>
            </CardContent>
            <CardFooter>
                 <Button onClick={() => router.push('/dashboard/tithes-and-offerings')}>Fechar Detalhes</Button>
            </CardFooter>
        </Card>
    </div>
  );
}