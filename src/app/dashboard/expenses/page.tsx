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
import { PlusCircle, MoreHorizontal, Loader2, Receipt } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ExpenseForm, type Expense } from "@/components/expense-form";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useSession } from "@/components/supabase-session-provider";
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js'; // Import type
import type { Service } from "@/components/service-form";
import type { Event } from "@/components/event-form";


export default function ExpensesPage() {
  const { user, loading: sessionLoading } = useSession();
  const { toast } = useToast();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchAllData = async () => {
      setLoading(true);
      try {
        const { data: expensesData, error: expensesError } = await supabase
          .from('expenses')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false });

        if (expensesError) throw expensesError;
        setExpenses(expensesData.map(e => ({
            id: e.id,
            description: e.description,
            amount: e.amount,
            date: e.date,
            category: e.category,
            paymentMethod: e.payment_method,
            observations: e.observations,
            sourceId: e.source_id, // Incluir sourceId
        } as Expense)));

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

    // Setup real-time subscription
    const subscriptions = [
      supabase.channel('expenses_changes').on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'expenses', filter: `user_id=eq.${user.id}` },
        (payload: RealtimePostgresChangesPayload<any>) => fetchAllData()
      ).subscribe(),
      supabase.channel('services_changes_expenses').on( // Novo canal para serviços
        'postgres_changes',
        { event: '*', schema: 'public', table: 'services', filter: `user_id=eq.${user.id}` },
        (payload: RealtimePostgresChangesPayload<Service>) => fetchAllData()
      ).subscribe(),
      supabase.channel('events_changes_expenses').on( // Novo canal para eventos
        'postgres_changes',
        { event: '*', schema: 'public', table: 'events', filter: `user_id=eq.${user.id}` },
        (payload: RealtimePostgresChangesPayload<Event>) => fetchAllData()
      ).subscribe(),
    ];

    return () => {
      subscriptions.forEach(sub => sub.unsubscribe());
    };
  }, [user, toast]);


  const handleFormSubmit = async (formData: Omit<Expense, 'id'>) => {
    if (!user) {
      toast({ variant: "destructive", title: "Erro", description: "Você precisa estar autenticado." });
      return;
    }

    const dataToSubmit = {
        user_id: user.id,
        description: formData.description,
        amount: formData.amount,
        date: formData.date,
        category: formData.category,
        payment_method: formData.paymentMethod,
        observations: formData.observations,
        source_id: formData.sourceId === 'nenhum' ? null : formData.sourceId, // Incluir source_id
    };

    setLoading(true);
    try {
      if (selectedExpense) {
        const { error } = await supabase
          .from('expenses')
          .update(dataToSubmit)
          .eq('id', selectedExpense.id);

        if (error) throw error;
        toast({ title: "Sucesso!", description: "Despesa atualizada com sucesso." });
      } else {
        const { error } = await supabase
          .from('expenses')
          .insert(dataToSubmit);

        if (error) throw error;
        toast({ title: "Sucesso!", description: "Despesa registrada com sucesso." });
      }
    } catch (error: any) {
       console.error("Failed to submit form:", error);
       // Log do erro completo para depuração
       console.error("Detailed Supabase error object:", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
       toast({ variant: "destructive", title: "Erro", description: `Não foi possível salvar a despesa. ${error.message || JSON.stringify(error)}` });
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
            .from('expenses')
            .delete()
            .eq('id', id);

        if (error) throw error;
        toast({
            title: "Registro Excluído",
            description: "A despesa foi removida com sucesso.",
        });
    } catch (error: any) {
        console.error("Error deleting expense:", error);
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
    setSelectedExpense(null);
    setIsSheetOpen(true);
  };

  const openSheetForEdit = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsSheetOpen(true);
  };

  const closeSheet = () => {
    setIsSheetOpen(false);
    setSelectedExpense(null);
  };

  const getSourceName = (sourceId?: string | null) => {
    if (!sourceId || sourceId === 'nenhum') return 'N/A';
    const [type, id] = sourceId.split('_');
    if (type === 'culto') {
        const service = services.find(s => s.id === id);
        return service ? `${service.name} (Culto)` : 'Culto Removido';
    } else if (type === 'evento') {
        const event = events.find(e => e.id === id);
        return event ? `${event.name} (Evento)` : 'Evento Removido';
    }
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
        <h1 className="text-3xl font-bold tracking-tight text-center md:text-left">Saídas e Despesas</h1>
        <Button onClick={openSheetForNew} disabled={loading}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Registrar Despesa
        </Button>
      </div>

       <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
            <SheetHeader>
                <SheetTitle>{selectedExpense ? 'Editar Despesa' : 'Registrar Nova Despesa'}</SheetTitle>
                <SheetDescription>
                {selectedExpense ? 'Atualize os detalhes da despesa.' : 'Preencha os detalhes para registrar uma nova saída.'}
                </SheetDescription>
            </SheetHeader>
            <ExpenseForm
                onFormSubmit={handleFormSubmit}
                onSheetClose={closeSheet}
                expenseData={selectedExpense}
                services={services} // Passando services
                events={events} // Passando events
            />
        </SheetContent>
      </Sheet>

      <Card>
        <CardHeader>
          <CardTitle>Registro de Saídas</CardTitle>
          <CardDescription>Gerencie as despesas e saídas financeiras da igreja.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead className="hidden md:table-cell">Data</TableHead>
                <TableHead className="hidden lg:table-cell">Categoria</TableHead>
                <TableHead className="hidden lg:table-cell">Origem</TableHead> {/* Nova coluna */}
                <TableHead>
                  <span className="sr-only">Ações</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                 <TableRow>
                  <TableCell colSpan={6} className="text-center h-24"> {/* Colspan ajustado */}
                     <div className="flex justify-center items-center">
                       <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                       <span>Carregando despesas...</span>
                     </div>
                  </TableCell>
                </TableRow>
              ) : expenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24"> {/* Colspan ajustado */}
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Receipt className="h-10 w-10 text-muted-foreground" />
                      <span className="text-muted-foreground">Nenhuma despesa registrada ainda.</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                expenses.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.description}</TableCell>
                    <TableCell>
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.amount)}
                    </TableCell>
                    <TableCell className="hidden md-table-cell">
                      {new Date(item.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                    </TableCell>
                     <TableCell className="hidden lg:table-cell">{item.category}</TableCell>
                     <TableCell className="hidden lg:table-cell">{getSourceName(item.sourceId)}</TableCell> {/* Exibindo origem */}
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
                               <Link href={`/dashboard/expenses/${item.id}`}>Ver Detalhes</Link>
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
                                            Essa ação não pode ser desfeita. Isso excluirá permanentemente o registro da despesa.
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