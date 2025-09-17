
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { PlusCircle, MoreHorizontal, Loader2, CalendarDays } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { EventForm, type Event } from "@/components/event-form";
import { collection, addDoc, onSnapshot, query, orderBy, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useToast } from "@/hooks/use-toast";

export default function EventsPage() {
  const [user, userLoading] = useAuthState(auth);
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

   useEffect(() => {
    if (user) {
      const eventsCollectionPath = `users/${user.uid}/events`;
      const q = query(collection(db, eventsCollectionPath), orderBy("dateTime", "desc"));
      
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const eventsData: Event[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          eventsData.push({
            id: doc.id,
            ...data,
          } as Event);
        });
        setEvents(eventsData);
        setLoading(false);
      }, (error) => {
        console.error("Error fetching events: ", error);
        toast({
            variant: "destructive",
            title: "Erro ao buscar eventos",
            description: "Não foi possível carregar a lista de eventos.",
        });
        setLoading(false);
      });

      return () => unsubscribe();
    } else if (!userLoading) {
      setEvents([]);
      setLoading(false);
    }
  }, [user, userLoading, toast]);


  const handleFormSubmit = async (formData: Omit<Event, 'id'>) => {
    if (!user) {
      toast({ variant: "destructive", title: "Erro", description: "Você precisa estar autenticado." });
      return;
    }
    const collectionPath = `users/${user.uid}/events`;

    if (selectedEvent) {
      const docRef = doc(db, collectionPath, selectedEvent.id);
      await updateDoc(docRef, formData);
      toast({ title: "Sucesso!", description: "Evento atualizado com sucesso." });
    } else {
      await addDoc(collection(db, collectionPath), formData);
      toast({ title: "Sucesso!", description: "Evento adicionado com sucesso." });
    }
    
    closeSheet();
  };

  const handleDeleteEvent = async (eventId: string) => {
     if (!user) {
      toast({ variant: "destructive", title: "Erro", description: "Você precisa estar autenticado." });
      return;
    }
    try {
        const docRef = doc(db, `users/${user.uid}/events`, eventId);
        await deleteDoc(docRef);
        toast({
            title: "Evento Excluído",
            description: "O evento foi removido com sucesso.",
        });
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Erro ao excluir",
            description: "Não foi possível remover o evento. Tente novamente.",
        });
    }
  }

  const openSheetForNew = () => {
    setSelectedEvent(null);
    setIsSheetOpen(true);
  };

  const openSheetForEdit = (event: Event) => {
    setSelectedEvent(event);
    setIsSheetOpen(true);
  };

  const closeSheet = () => {
    setIsSheetOpen(false);
    setSelectedEvent(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Agendamento de Eventos</h1>
        <Button onClick={openSheetForNew}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Agendar Evento
        </Button>
      </div>

       <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
            <SheetHeader>
                <SheetTitle>{selectedEvent ? 'Editar Evento' : 'Agendar Novo Evento'}</SheetTitle>
                <SheetDescription>
                {selectedEvent ? 'Atualize os detalhes do evento abaixo.' : 'Preencha os detalhes do evento abaixo.'}
                </SheetDescription>
            </SheetHeader>
            <EventForm
                onFormSubmit={handleFormSubmit}
                onSheetClose={closeSheet}
                eventData={selectedEvent}
            />
        </SheetContent>
      </Sheet>

      <Card>
        <CardHeader>
          <CardTitle>Próximos Eventos</CardTitle>
          <CardDescription>Lista de eventos programados.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Data e Hora</TableHead>
                <TableHead>
                  <span className="sr-only">Ações</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                 <TableRow>
                  <TableCell colSpan={3} className="text-center h-24">
                     <div className="flex justify-center items-center">
                       <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                       <span>Carregando eventos...</span>
                     </div>
                  </TableCell>
                </TableRow>
              ) : events.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center h-24">
                    Nenhum evento registrado ainda.
                  </TableCell>
                </TableRow>
              ) : (
                events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium">{event.name}</TableCell>
                    <TableCell>{new Date(event.dateTime).toLocaleString('pt-BR', { timeZone: 'UTC', dateStyle: 'short', timeStyle: 'short' })}</TableCell>
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
                               <Link href={`/dashboard/events/${event.id}`}>Ver Detalhes</Link>
                           </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => openSheetForEdit(event)}>Editar</DropdownMenuItem>
                           <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">Excluir</DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Essa ação não pode ser desfeita. Isso excluirá permanentemente o evento.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDeleteEvent(event.id)}>Excluir</AlertDialogAction>
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

