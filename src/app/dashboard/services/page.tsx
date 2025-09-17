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
import { PlusCircle, MoreHorizontal, Loader2, BookOpenCheck } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ServiceForm, type Service } from "@/components/service-form";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "@/components/supabase-session-provider";
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js'; // Import type

export default function ServicesPage() {
  const { user, loading: sessionLoading } = useSession();
  const { toast } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchServices = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('user_id', user.id)
        .order('date_time', { ascending: false });

      if (error) {
        console.error("Error fetching services: ", error);
        toast({
            variant: "destructive",
            title: "Erro ao buscar cultos",
            description: "Não foi possível carregar a lista de cultos.",
        });
      } else {
        setServices(data.map(s => ({
            id: s.id,
            name: s.name,
            dateTime: s.date_time,
            preacher: s.preacher,
            theme: s.theme,
            observations: s.observations,
            presentMembers: s.present_members,
            presentVisitors: s.present_visitors,
        } as Service)));
      }
      setLoading(false);
    };

    fetchServices();

    // Setup real-time subscription
    const subscription = supabase
      .channel('services_changes') // Unique channel name
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'services', filter: `user_id=eq.${user.id}` },
        (payload: RealtimePostgresChangesPayload<Service>) => { // Type payload
          fetchServices(); // Re-fetch all services on any change
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, toast]);


  const handleFormSubmit = async (formData: Omit<Service, 'id'>) => {
    if (!user) {
      toast({ variant: "destructive", title: "Erro", description: "Você precisa estar autenticado." });
      return;
    }

    const dataToSubmit = {
        user_id: user.id,
        name: formData.name,
        date_time: formData.dateTime,
        preacher: formData.preacher,
        theme: formData.theme,
        observations: formData.observations,
        present_members: formData.presentMembers || [],
        present_visitors: formData.presentVisitors || [],
    };

    setLoading(true);
    try {
      if (selectedService) {
        const { error } = await supabase
          .from('services')
          .update(dataToSubmit)
          .eq('id', selectedService.id);

        if (error) throw error;
        toast({ title: "Sucesso!", description: "Culto atualizado com sucesso." });
      } else {
        const { error } = await supabase
          .from('services')
          .insert(dataToSubmit);

        if (error) throw error;
        toast({ title: "Sucesso!", description: "Culto adicionado com sucesso." });
      }
    } catch (error: any) {
       console.error("Failed to submit form:", error);
       toast({ variant: "destructive", title: "Erro", description: `Não foi possível salvar o culto. ${error.message}` });
    } finally {
      setLoading(false);
      closeSheet();
    }
  };

  const handleDeleteService = async (serviceId: string) => {
     if (!user) {
      toast({ variant: "destructive", title: "Erro", description: "Você precisa estar autenticado." });
      return;
    }
    setLoading(true);
    try {
        const { error } = await supabase
            .from('services')
            .delete()
            .eq('id', serviceId);

        if (error) throw error;
        toast({
            title: "Culto Excluído",
            description: "O culto foi removido com sucesso.",
        });
    } catch (error: any) {
        console.error("Error deleting service:", error);
        toast({
            variant: "destructive",
            title: "Erro ao excluir",
            description: `Não foi possível remover o culto. ${error.message}`,
        });
    } finally {
        setLoading(false);
    }
  }

  const openSheetForNew = () => {
    setSelectedService(null);
    setIsSheetOpen(true);
  };

  const openSheetForEdit = (service: Service) => {
    setSelectedService(service);
    setIsSheetOpen(true);
  };

  const closeSheet = () => {
    setIsSheetOpen(false);
    setSelectedService(null);
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
        <h1 className="text-3xl font-bold tracking-tight text-center md:text-left">Gestão de Cultos</h1>
        <Button onClick={openSheetForNew} disabled={loading}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Adicionar Culto
        </Button>
      </div>

       <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
            <SheetHeader>
                <SheetTitle>{selectedService ? 'Editar Culto' : 'Adicionar Novo Culto'}</SheetTitle>
                <SheetDescription>
                {selectedService ? 'Atualize os detalhes do culto abaixo.' : 'Preencha os detalhes para cadastrar um novo culto.'}
                </SheetDescription>
            </SheetHeader>
            <ServiceForm
                onFormSubmit={handleFormSubmit}
                onSheetClose={closeSheet}
                serviceData={selectedService}
            />
        </SheetContent>
      </Sheet>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Cultos</CardTitle>
          <CardDescription>Visualize e gerencie os cultos da sua igreja.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Data e Hora</TableHead>
                <TableHead className="hidden md:table-cell">Pregador</TableHead>
                <TableHead>
                  <span className="sr-only">Ações</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                 <TableRow>
                  <TableCell colSpan={4} className="text-center h-24">
                     <div className="flex justify-center items-center">
                       <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                       <span>Carregando cultos...</span>
                     </div>
                  </TableCell>
                </TableRow>
              ) : services.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center h-24">
                    Nenhum culto registrado ainda.
                  </TableCell>
                </TableRow>
              ) : (
                services.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell className="font-medium">{service.name}</TableCell>
                    <TableCell>{new Date(service.dateTime).toLocaleString('pt-BR', { timeZone: 'UTC', dateStyle: 'short', timeStyle: 'short' })}</TableCell>
                    <TableCell className="hidden md:table-cell">{service.preacher}</TableCell>
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
                               <Link href={`/dashboard/services/${service.id}`}>Ver Detalhes</Link>
                           </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => openSheetForEdit(service)}>Editar</DropdownMenuItem>
                           <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">Excluir</DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Essa ação não pode ser desfeita. Isso excluirá permanentemente o culto.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDeleteService(service.id)}>Excluir</AlertDialogAction>
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