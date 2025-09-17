"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
import { PlusCircle, MoreHorizontal, Loader2 } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { VisitorForm, type Visitor } from "@/components/visitor-form";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import type { Service } from "@/components/service-form";
import type { Event } from "@/components/event-form";
import { useSession } from "@/components/supabase-session-provider";

export default function VisitorsPage() {
  const { user, loading: sessionLoading } = useSession();
  const { toast } = useToast();
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchAllData = async () => {
      setLoading(true);
      try {
        const { data: visitorsData, error: visitorsError } = await supabase
          .from('visitors')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

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

        const { data: servicesData, error: servicesError } = await supabase
          .from('services')
          .select('*')
          .eq('user_id', user.id);
        if (servicesError) throw servicesError;
        setServices(servicesData.map(s => ({
            id: s.id,
            name: s.name,
            dateTime: s.date_time,
            preacher: s.preacher,
            theme: s.theme,
            observations: s.observations,
            presentMembers: s.present_members,
            presentVisitors: s.present_visitors,
        } as Service)));

        const { data: eventsData, error: eventsError } = await supabase
          .from('events')
          .select('*')
          .eq('user_id', user.id);
        if (eventsError) throw eventsError;
        setEvents(eventsData.map(e => ({
            id: e.id,
            name: e.name,
            dateTime: e.date_time,
            information: e.information,
            presentVisitors: e.present_visitors,
        } as Event)));

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
      supabase.from('visitors').on('*', payload => fetchAllData()).subscribe(),
      supabase.from('services').on('*', payload => fetchAllData()).subscribe(),
      supabase.from('events').on('*', payload => fetchAllData()).subscribe(),
    ];

    return () => {
      subscriptions.forEach(sub => sub.unsubscribe());
    };
  }, [user, toast]);


  const handleFormSubmit = async (formData: Omit<Visitor, 'id' | 'createdAt'>) => {
    if (!user) {
      toast({ variant: "destructive", title: "Erro", description: "Você precisa estar autenticado." });
      return;
    }
    let visitorIdToUpdate: string | undefined;

    const dataToSubmit = {
        user_id: user.id,
        full_name: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        is_christian: formData.isChristian,
        denomination: formData.denomination || null,
        source_id: formData.sourceId === 'nenhum' ? null : formData.sourceId,
    };
    
    let visitDate = new Date().toISOString();
    if(dataToSubmit.source_id) {
        const [type, id] = dataToSubmit.source_id.split('_');
        if (type === 'event') {
            const event = events.find(e => e.id === id);
            if (event) visitDate = event.dateTime;
        } else if (type === 'service') {
             const service = services.find(s => s.id === id);
             if (service) visitDate = service.dateTime;
        }
    }

    setLoading(true);
    try {
      if (selectedVisitor) {
        visitorIdToUpdate = selectedVisitor.id;
        
        const updateData: Partial<typeof dataToSubmit & { created_at?: string }> = {
            ...dataToSubmit,
        };

        // Only update created_at if sourceId changed
        if (selectedVisitor.sourceId !== dataToSubmit.source_id) {
            updateData.created_at = visitDate;
        }

        const { error } = await supabase
          .from('visitors')
          .update(updateData)
          .eq('id', selectedVisitor.id);

        if (error) throw error;
        toast({ title: "Sucesso!", description: "Visitante atualizado com sucesso." });
      } else {
        const { data, error } = await supabase
          .from('visitors')
          .insert({
            ...dataToSubmit,
            created_at: visitDate,
          })
          .select('id')
          .single();

        if (error) throw error;
        visitorIdToUpdate = data.id;
        toast({ title: "Sucesso!", description: "Visitante adicionado com sucesso." });
      }
      
      // If a source was selected, update the event or service with the visitor's ID
      const { source_id } = dataToSubmit;
      if (source_id && visitorIdToUpdate) {
          const [type, id] = source_id.split('_');
          if (type === 'service') {
            const { error: updateSourceError } = await supabase
              .from('services')
              .update({ present_visitors: (services.find(s => s.id === id)?.presentVisitors || []).concat(visitorIdToUpdate) })
              .eq('id', id);
            if (updateSourceError) console.error("Error updating service with visitor:", updateSourceError);
          } else if (type === 'event') {
               const { error: updateSourceError } = await supabase
                .from('events')
                .update({ present_visitors: (events.find(e => e.id === id)?.presentVisitors || []).concat(visitorIdToUpdate) })
                .eq('id', id);
              if (updateSourceError) console.error("Error updating event with visitor:", updateSourceError);
          }
      }

    } catch (error: any) {
       console.error("Failed to submit form:", error);
       toast({ variant: "destructive", title: "Erro", description: `Não foi possível salvar o visitante. ${error.message}` });
    } finally {
      setLoading(false);
      closeSheet();
    }
  };

  const handleDeleteVisitor = async (visitorId: string) => {
     if (!user) {
      toast({ variant: "destructive", title: "Erro", description: "Você precisa estar autenticado." });
      return;
    }
    setLoading(true);
    try {
        // Remove visitor from events
        const { data: eventsToUpdate, error: fetchEventsError } = await supabase
            .from('events')
            .select('id, present_visitors')
            .eq('user_id', user.id)
            .contains('present_visitors', [visitorId]);

        if (fetchEventsError) throw fetchEventsError;

        for (const event of eventsToUpdate) {
            const updatedVisitors = event.present_visitors.filter((id: string) => id !== visitorId);
            const { error: updateEventError } = await supabase
                .from('events')
                .update({ present_visitors: updatedVisitors })
                .eq('id', event.id);
            if (updateEventError) console.error("Error updating event after visitor delete:", updateEventError);
        }
        
        // Remove visitor from services
        const { data: servicesToUpdate, error: fetchServicesError } = await supabase
            .from('services')
            .select('id, present_visitors')
            .eq('user_id', user.id)
            .contains('present_visitors', [visitorId]);

        if (fetchServicesError) throw fetchServicesError;

        for (const service of servicesToUpdate) {
            const updatedVisitors = service.present_visitors.filter((id: string) => id !== visitorId);
            const { error: updateServiceError } = await supabase
                .from('services')
                .update({ present_visitors: updatedVisitors })
                .eq('id', service.id);
            if (updateServiceError) console.error("Error updating service after visitor delete:", updateServiceError);
        }

        // Remove visitor from contributions
        const { error: deleteContributionsError } = await supabase
            .from('tithes_offerings')
            .delete()
            .eq('member_id', visitorId)
            .eq('user_id', user.id);
        if (deleteContributionsError) throw deleteContributionsError;

        // Finally, delete the visitor
        const { error: deleteVisitorError } = await supabase
            .from('visitors')
            .delete()
            .eq('id', visitorId);
        if (deleteVisitorError) throw deleteVisitorError;

        toast({
            title: "Visitante Excluído",
            description: "O visitante e todas as suas referências foram removidos com sucesso.",
        });
    } catch (error: any) {
        console.error("Error deleting visitor and references: ", error);
        toast({
            variant: "destructive",
            title: "Erro ao excluir",
            description: `Não foi possível remover o visitante. ${error.message}`,
        });
    } finally {
        setLoading(false);
    }
  }

  const openSheetForNew = () => {
    setSelectedVisitor(null);
    setIsSheetOpen(true);
  };

  const openSheetForEdit = (visitor: Visitor) => {
    setSelectedVisitor(visitor);
    setIsSheetOpen(true);
  };

  const closeSheet = () => {
    setIsSheetOpen(false);
    setSelectedVisitor(null);
  };

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
        <h1 className="text-3xl font-bold tracking-tight text-center md:text-left">Gestão de Visitantes</h1>
        <Button onClick={openSheetForNew} disabled={loading}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Adicionar Visitante
        </Button>
      </div>

       <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
            <SheetHeader>
                <SheetTitle>{selectedVisitor ? 'Editar Visitante' : 'Adicionar Novo Visitante'}</SheetTitle>
                <SheetDescription>
                {selectedVisitor ? 'Atualize os detalhes do visitante abaixo.' : 'Preencha os detalhes para cadastrar um novo visitante.'}
                </SheetDescription>
            </SheetHeader>
            <VisitorForm
                onFormSubmit={handleFormSubmit}
                onSheetClose={closeSheet}
                visitorData={selectedVisitor}
                services={services}
                events={events}
            />
        </SheetContent>
      </Sheet>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Visitantes</CardTitle>
          <CardDescription>Acompanhe os visitantes da sua igreja.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead className="hidden md:table-cell">Email</TableHead>
                <TableHead className="hidden lg:table-cell">Telefone</TableHead>
                <TableHead>Data da Visita</TableHead>
                <TableHead>
                  <span className="sr-only">Ações</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                 <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">
                     <div className="flex justify-center items-center">
                       <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                       <span>Carregando visitantes...</span>
                     </div>
                  </TableCell>
                </TableRow>
              ) : visitors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">
                    Nenhum visitante registrado ainda.
                  </TableCell>
                </TableRow>
              ) : (
                visitors.map((visitor) => (
                  <TableRow key={visitor.id}>
                    <TableCell className="font-medium">{visitor.fullName}</TableCell>
                    <TableCell className="hidden md:table-cell">{visitor.email}</TableCell>
                    <TableCell className="hidden lg:table-cell">{visitor.phone}</TableCell>
                    <TableCell>{new Date(visitor.createdAt).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</TableCell>
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
                               <Link href={`/dashboard/visitors/${visitor.id}`}>Ver Perfil</Link>
                           </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => openSheetForEdit(visitor)}>Editar</DropdownMenuItem>
                           <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">Excluir</DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Essa ação não pode ser desfeita. Isso excluirá permanentemente o visitante e todas as suas referências (presenças, contribuições, etc).
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDeleteVisitor(visitor.id)}>Excluir</AlertDialogAction>
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