'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, User, Mail, Phone, Home, Calendar, CheckSquare, XSquare, Crown, Shield } from 'lucide-react';
import type { Member } from '@/components/member-form';
import { useSession } from '@/components/supabase-session-provider';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js'; // Import type

export default function MemberProfilePage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading: sessionLoading } = useSession();
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);

  const memberId = params.id as string;

  useEffect(() => {
    if (!user || !memberId) {
        setLoading(false);
        return;
    }

    const fetchMember = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('members')
            .select('*')
            .eq('id', memberId)
            .eq('user_id', user.id)
            .single();

        if (error) {
            console.error("Error fetching member:", error);
            setMember(null);
        } else if (data) {
            setMember({
                id: data.id,
                fullName: data.full_name,
                phone: data.phone,
                email: data.email,
                address: data.address,
                isBaptized: data.is_baptized,
                status: data.status,
                role: data.role,
                joined: data.joined,
            } as Member);
        } else {
            setMember(null);
        }
        setLoading(false);
    };

    fetchMember();

    // Real-time subscription for the specific member
    const subscription = supabase
      .channel(`member_${memberId}_changes`) // Unique channel name
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'members', filter: `id=eq.${memberId}` },
        (payload: RealtimePostgresChangesPayload<any>) => { // Type payload changed to any for flexibility
          fetchMember(); // Re-fetch on any change to this member
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, memberId]);

  if (loading || sessionLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!member) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center text-center">
        <h2 className="text-2xl font-semibold">Membro não encontrado</h2>
        <p className="text-muted-foreground">O membro que você está procurando não existe ou foi removido.</p>
        <Button onClick={() => router.push('/dashboard/members')} className="mt-4">
          Voltar para Membros
        </Button>
      </div>
    );
  }

  const roleIcons = {
    Membro: <User className="h-4 w-4" />,
    Líder: <Crown className="h-4 w-4 text-yellow-500" />,
    Pastor: <Shield className="h-4 w-4 text-blue-500" />,
  };
  

  return (
    <div className="space-y-6">
        <Button variant="outline" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
        </Button>

        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div className='space-y-1.5'>
                    <CardTitle className="text-3xl flex items-center gap-2">
                        {member.fullName}
                    </CardTitle>
                    <CardDescription>Perfil detalhado do membro.</CardDescription>
                </div>
                <Badge variant={member.status === 'Ativo' ? 'secondary' : 'outline'} className="text-sm">
                  {member.status}
                </Badge>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-primary">Informações Pessoais</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-center gap-3">
                            <Mail className="h-4 w-4" />
                            <span>{member.email}</span>
                        </li>
                         <li className="flex items-center gap-3">
                            <Phone className="h-4 w-4" />
                            <span>{member.phone}</span>
                        </li>
                         <li className="flex items-center gap-3">
                            <Home className="h-4 w-4" />
                            <span>{member.address}</span>
                        </li>
                    </ul>
                </div>
                 <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-primary">Informações da Igreja</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-center gap-3">
                            <Calendar className="h-4 w-4" />
                            <span>Membro desde: {new Date(member.joined).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</span>
                        </li>
                        <li className="flex items-center gap-3">
                            {member.isBaptized === 'sim' 
                                ? <CheckSquare className="h-4 w-4 text-green-600" />
                                : <XSquare className="h-4 w-4 text-destructive" />
                            }
                            <span>{member.isBaptized === 'sim' ? 'Batizado' : 'Não Batizado'}</span>
                        </li>
                         <li className="flex items-center gap-3">
                            {roleIcons[member.role]}
                            <span>Função: {member.role}</span>
                        </li>
                    </ul>
                </div>
            </CardContent>
            <CardFooter>
                 <Button onClick={() => router.push('/dashboard/members')}>Fechar Perfil</Button>
            </CardFooter>
        </Card>
    </div>
  );
}