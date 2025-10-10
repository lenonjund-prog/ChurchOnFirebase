"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PlusCircle, MoreHorizontal, Loader2, HandCoins } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { TitheOfferingForm, type TitheOffering } from "@/components/tithe-offering-form";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import type { Member } from "@/components/member-form";
import type { Visitor } from "@/components/visitor-form";
// Removido import de Service e Event
// import type { Service } from "@/components/service-form";
// import type { Event } from "@/components/event-form";
import Link from "next/link";
import { useSession } from "@/components/supabase-session-provider";
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js'; // Import type


export default function TithesAndOfferingsPage() {
  const { user, loading: sessionLoading } = useSession();
  const { toast } = useToast();
  const [contributions, setContributions] = useState<(TitheOffering & { id: string })[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  // Removido estados para services e events
  // const [services, setServices] = useState<Service[]>([]);
  // const [events, setEvents] = useState<Event[]>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedContribution, setSelectedContribution] = useState<(TitheOffering & { id: string }) | null>(null);
  
  const people = [
    ...members.map(m => ({ ...m, type: 'Membro' })),
    ...visitors.map(v => ({ ...v, type: 'Visitante' }))
  ];

  // Removido sources, pois não é mais necessário
  // const sources = [
  //   ...services.map(s => ({ ...s, source_type: 'Culto' })),
  //   ...events.map(e => ({ ...e, source_type: 'Evento' }))
  // ];


  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchAllData = async () => {
      setLoading(true);
      try {
        const { data: contributionsData, error: contributionsError } = await supabase
          .from('tithes_offerings')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false });

        if (contributionsError) throw contributionsError;
        setContributions(contributionsData.map(c => ({
            id: c.id,
            memberId: c.member_id,
            type: c.type,
            amount: c.amount,
            date: c.date,
            method: c.method,
            observations: c.observations,
            sourceId: c.source_id,
        } as TitheOffering & { id: string })));

        const { data: membersData, error: membersError } = await supabase
          .from('members')
          .select('*')
          .eq('user_id', user.id);
        if (membersError) throw membersError;
        setMembers(membersData.map(m => ({
            id: m.id,
            fullName: m.full_name,
            phone: m.phone,
            email: m.email,
            address: m.address,
            isBaptized: m.is_baptized,
            status: m.status,
            role: m.role,
            joined: m.joined,
        } as Member)));

        const { data: visitorsData, error: visitorsError } = await supabase
          .from('visitors')
          .select('*')
          .eq('user_id', user.id);
        if (visitorsError) throw visitorsError;
        setVisitors(visitorsData.map(v => ({
            id: v.id,
            fullName: v.full_name,
            phone: v.phone,
            email: v.email,
            address: v.address,
            isChristian: v.is_christian,
            denomination: v.denomination,
            createdAt: v.created_at,
            sourceId: v.source_id,
        } as Visitor)));

        // Removido fetch de services e events
        // const { data: servicesData, error: servicesError } = await supabase
        //   .from('services')
        //   .select('*')
        //   .eq('user_id', user.id);
        // if (servicesError) throw servicesError;
        // setServices(servicesData.map(s => ({
        //     id: s.id,
        //     name: s.name,
        //     dateTime: s.date_time,
        //     preacher: s.preacher,
        //     theme: s.theme,
        //     observations: s.observations,
        //     presentMembers: s.present_members,
        //     presentVisitors: s.present_visitors,
        // } as Service)));

        // const { data: eventsData, error: eventsError } = await supabase
        //   .from('events')
        //   .select('*')
        //   .eq('user_id', user.id);
        // if (eventsError) throw eventsError;
        // setEvents(eventsData.map(e => ({
        //     id: e.id,
        //     name: e.name,
        //     dateTime: e.date_time,
        //     information: e.information,
        //     presentVisitors: e.present_visitors,
        // } as Event)));

      } catch (error: any) {
        console.error("Error fetching data: ", error);
        toast({ variant: "destructive", title: "Erro ao buscar dados", description: `Não foi possível carregar os registros. ${error.message}` });
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();

    // Setup real-time subscriptions for all relevant tables
    const subscriptions = [
      supabase.channel('tithes_offerings_changes').on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tithes_offerings', filter: `user_id=eq.${user.id}` },
        (payload: RealtimePostgresChangesPayload<TitheOffering>) => fetchAllData()
      ).subscribe(),
      supabase.channel('members_changes_tithes').on( // Unique channel name
        'postgres_changes',
        { event: '*', schema: 'public', table: 'members', filter: `user_id=eq.${user.id}` },
        (payload: RealtimePostgresChangesPayload<Member>) => fetchAllData()
      ).subscribe(),
      supabase.channel('visitors_changes_tithes').on( // Unique channel name
        'postgres_changes',
        { event: '*', schema: 'public', table: 'visitors', filter: `user_id=eq.${user.id}` },
        (payload: RealtimePostgresChangesPayload<Visitor>) => fetchAllData()
      ).subscribe(),
      // Removido subscriptions para services e events
      // supabase.channel('services_changes_tithes').on( // Unique channel name
      //   'postgres_changes',
      //   { event: '*', schema: 'public', table: 'services', filter: `user_id=eq.${user.id}` },
      //   (payload: RealtimePostgresChangesPayload<Service>) => fetchAllData()
      // ).subscribe(),
      // supabase.channel('events_changes_tithes').on( // Unique channel name
      //   'postgres_changes',
      //   { event: '*', schema: 'public', table: 'events', filter: `user_id=eq.${user.id}` },
      //   (payload: RealtimePostgresChangesPayload<Event>) => fetchAllData()
      // ).subscribe(),
    ];

    return () => {
      subscriptions.forEach(sub => sub.unsubscribe());
    };
  }, [user, toast]);


  const handleFormSubmit = async (formData: Omit<TitheOffering, 'id'>) => {
    if (!user) {
      toast({ variant: "destructive", title: "Erro", description: "Você precisa estar autenticado." });
      return;
    }

    const dataToSubmit = {
        user_id: user.id,
        member_id: formData.memberId,
        type: formData.type,
        amount: formData.amount,
        date: formData.date,
        method: formData.method,
        observations: formData.observations,
        source_id: formData.sourceId === 'nenhum' ? null : formData.sourceId,
    };

    setLoading(true);
    try {
      if (selectedContribution) {
        const { error } = await supabase
          .from('tithes_offerings')
          .update(dataToSubmit)
          .eq('id', selectedContribution.id);

        if (error) throw error;
        toast({ title: "Sucesso!", description: "Contribuição atualizada com sucesso." });
      } else {
        const { error } = await supabase
          .from('tithes_offerings')
          .insert(dataToSubmit);

        if (error) throw error;
        toast({ title: "Sucesso!", description: "Contribuição adicionada com sucesso." });
      }
    } catch (error: any) {
       console.error("Failed to submit form:", error);
       toast({ variant: "destructive", title: "Erro", description: `Não foi possível salvar a contribuição. ${error.message}` });
    } finally {
      setLoading(false);
      closeSheet();
    }
  };

  const handleDelete = async (id: string) => {
     if (!user) {
      toast({ variant: "destructive", title: "Erro", description: "Você precisa estar autenticado." });
      return;
    }
    setLoading(true);
    try {
        const { error } = await supabase
            .from('tithes_offerings')
            .delete()
            .eq('id', id);

        if (error) throw error;
        toast({
            title: "Registro Excluído",
            description: "A contribuição foi removida com sucesso.",
        });
    } catch (error: any) {
        console.error("Error deleting contribution:", error);
        toast({
            variant: "destructive",
            title: "Erro ao excluir",
            description: `Não foi possível remover o registro. ${error.message}`,
        });
    } finally {
        setLoading(false);
    }
  }

  const openSheetForNew = () => {
    setSelectedContribution(null);
    setIsSheetOpen(true);
  };

  const openSheetForEdit = (contribution: TitheOffering & { id: string }) => {
    setSelectedContribution(contribution);
    setIsSheetOpen(true);
  };

  const closeSheet = () => {
    setIsSheetOpen(false);
    setSelectedContribution(null);
  };

  const getContributorName = (contributorId: string) => {
    if (contributorId === 'anonimo') return 'Anônimo';
    const person = people.find(p => p.id === contributorId);
    if (!person) return 'Desconhecido';
    return `${person.fullName} (${person.type})`;
  }

  const getSourceName = (sourceId?: string | null) => {
    if (!sourceId || sourceId === 'nenhum') return 'N/A';
    // A lógica de sourceName agora precisaria buscar os dados de services e events
    // Se não houver mais services e events carregados aqui, esta função precisaria ser ajustada
    // Para simplificar, vamos retornar 'N/A' se não houver dados de origem disponíveis.
    return 'N/A';
  }

  if (sessionLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className='ml-2'>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-center md:text-left">Dízimos e Ofertas</h1>
        <Button onClick={openSheetForNew} disabled={loading}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Registrar Contribuição
        </Button>
      </div>

       <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
            <SheetHeader>
                <SheetTitle>{selectedContribution ? 'Editar Registro' : 'Registrar Contribuição'}</SheetTitle>
                <SheetDescription>
                {selectedContribution ? 'Atualize os detalhes da contribuição.' : 'Preencha os detalhes para registrar uma nova contribuição.'}
                </SheetDescription>
            </SheetHeader>
            <TitheOfferingForm
                onFormSubmit={handleFormSubmit}
                onSheetClose={closeSheet}
                contributionData={selectedContribution}
                members={members}
                visitors={visitors}
                // Removido services e events das props
                // services={services}
                // events={events}
            />
        </SheetContent>
      </Sheet>

      <Card>
        <CardHeader>
          <CardTitle>Registro de Dízimos e Ofertas</CardTitle>
          <CardDescription>Gerencie as contribuições financeiras da igreja.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contribuinte</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead className="hidden md:table-cell">Data</TableHead>
                <TableHead className="hidden lg:table-cell">Origem</TableHead>
                <TableHead>
                  <span className="sr-only">Ações</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                 <TableRow>
                  <TableCell colSpan={6} className="text-center h-24">
                     <div className="flex justify-center items-center">
                       <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                       <span>Carregando registros...</span>
                     </div>
                  </TableCell>
                </TableRow>
              ) : contributions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <HandCoins className="h-10 w-10 text-muted-foreground" />
                      <span className="text-muted-foreground">Nenhuma contribuição registrada ainda.</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                contributions.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{getContributorName(item.memberId)}</TableCell>
                    <TableCell>{item.type}</TableCell>
                    <TableCell>
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.amount)}
                    </TableCell>
                    <TableCell className="hidden md-table-cell">
                      {new Date(item.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                    </TableCell>
                     <TableCell className="hidden lg:table-cell">{getSourceName(item.sourceId)}</TableCell>
                    <TableCell>
                       <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                           <DropdownMenuItem asChild>
                               <Link href={`/dashboard/tithes-and-offerings/${item.id}`}>Ver Detalhes</Link>
                           </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => openSheetForEdit(item)}>Editar</DropdownMenuItem>
                           <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">Excluir</DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Essa ação não pode ser desfeita. Isso excluirá permanentemente o registro.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDelete(item.id)}>Excluir</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}