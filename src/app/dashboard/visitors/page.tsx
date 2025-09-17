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
import { collection, addDoc, onSnapshot, query, orderBy, doc, updateDoc, deleteDoc, writeBatch, getDocs, getDoc, arrayUnion, where } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useToast } from "@/hooks/use-toast";
import type { Service } from "@/components/service-form";
import type { Event } from "@/components/event-form";

export default function VisitorsPage() {
  const [user, userLoading] = useAuthState(auth);
  const { toast } = useToast();
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null);

  useEffect(() => {
    if (user) {
      const visitorsCollectionPath = `users/${user.uid}/visitors`;
      const q = query(collection(db, visitorsCollectionPath), orderBy("createdAt", "desc"));
      
      const unsubscribeVisitors = onSnapshot(q, (querySnapshot) => {
        const visitorsData: Visitor[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          visitorsData.push({
            id: doc.id,
            ...data,
          } as Visitor);
        });
        setVisitors(visitorsData);
        setLoading(false);
      }, (error) => {
        console.error("Error fetching visitors: ", error);
        toast({
            variant: "destructive",
            title: "Erro ao buscar visitantes",
            description: "Não foi possível carregar a lista de visitantes.",
        });
        setLoading(false);
      });
      
      const servicesQuery = query(collection(db, `users/${user.uid}/services`));
      const unsubscribeServices = onSnapshot(servicesQuery, (snapshot) => {
          setServices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service)));
      });

      const eventsQuery = query(collection(db, `users/${user.uid}/events`));
      const unsubscribeEvents = onSnapshot(eventsQuery, (snapshot) => {
          setEvents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Event)));
      });

      return () => {
        unsubscribeVisitors();
        unsubscribeServices();
        unsubscribeEvents();
      };
    } else if (!userLoading) {
      setVisitors([]);
      setServices([]);
      setEvents([]);
      setLoading(false);
    }
  }, [user, userLoading, toast]);


  const handleFormSubmit = async (formData: Omit<Visitor, 'id' | 'createdAt'>) => {
    if (!user) {
      toast({ variant: "destructive", title: "Erro", description: "Você precisa estar autenticado." });
      return;
    }
    const visitorsCollectionPath = `users/${user.uid}/visitors`;
    let visitorIdToUpdate: string | undefined;

    const dataToSubmit = { ...formData };
    
    let visitDate = new Date().toISOString();
    if(dataToSubmit.sourceId && dataToSubmit.sourceId !== 'nenhum') {
        const [type, id] = dataToSubmit.sourceId.split('_');
        if (type === 'event') {
            const event = events.find(e => e.id === id);
            if (event) visitDate = event.dateTime;
        } else if (type === 'service') {
             const service = services.find(s => s.id === id);
             if (service) visitDate = service.dateTime;
        }
    }


    if (selectedVisitor) {
        visitorIdToUpdate = selectedVisitor.id;
        const visitorDocRef = doc(db, visitorsCollectionPath, selectedVisitor.id);
        
        const updateData: Partial<Visitor> = {
            ...dataToSubmit,
        };

        if (selectedVisitor.sourceId !== dataToSubmit.sourceId) {
            updateData.createdAt = visitDate;
        } else {
            delete (updateData as any).createdAt;
        }

        await updateDoc(visitorDocRef, updateData);
        toast({ title: "Sucesso!", description: "Visitante atualizado com sucesso." });
    } else {
        const newVisitorData = {
            ...dataToSubmit,
            createdAt: visitDate,
        };
        const docRef = await addDoc(collection(db, visitorsCollectionPath), newVisitorData);
        visitorIdToUpdate = docRef.id;
        toast({ title: "Sucesso!", description: "Visitante adicionado com sucesso." });
    }
    
    // If a source was selected, update the event or service with the visitor's ID
    const { sourceId } = formData;
    if (sourceId && sourceId !== 'nenhum' && visitorIdToUpdate) {
        const [type, id] = sourceId.split('_');
        let sourceDocRef;
        if (type === 'service') {
          sourceDocRef = doc(db, `users/${user.uid}/services/${id}`);
           await updateDoc(sourceDocRef, {
                presentVisitors: arrayUnion(visitorIdToUpdate)
            });
        } else if (type === 'event') {
             sourceDocRef = doc(db, `users/${user.uid}/events/${id}`);
             await updateDoc(sourceDocRef, {
                presentVisitors: arrayUnion(visitorIdToUpdate)
            });
        }
    }
    
    closeSheet();
  };

  const handleDeleteVisitor = async (visitorId: string) => {
     if (!user) {
      toast({ variant: "destructive", title: "Erro", description: "Você precisa estar autenticado." });
      return;
    }
    try {
        const batch = writeBatch(db);

        // Reference to the visitor to be deleted
        const visitorDocRef = doc(db, `users/${user.uid}/visitors`, visitorId);
        batch.delete(visitorDocRef);

        // Remove visitor from events
        const eventsQuery = query(collection(db, `users/${user.uid}/events`), where('presentVisitors', 'array-contains', visitorId));
        const eventsSnapshot = await getDocs(eventsQuery);
        eventsSnapshot.forEach(eventDoc => {
            const currentVisitors = eventDoc.data().presentVisitors || [];
            batch.update(eventDoc.ref, { presentVisitors: currentVisitors.filter((id: string) => id !== visitorId) });
        });
        
        // Remove visitor from services
        const servicesQuery = query(collection(db, `users/${user.uid}/services`), where('presentVisitors', 'array-contains', visitorId));
        const servicesSnapshot = await getDocs(servicesQuery);
        servicesSnapshot.forEach(serviceDoc => {
            const currentVisitors = serviceDoc.data().presentVisitors || [];
            batch.update(serviceDoc.ref, { presentVisitors: currentVisitors.filter((id: string) => id !== visitorId) });
        });

        // Remove visitor from contributions
        const contributionsQuery = query(collection(db, `users/${user.uid}/tithes-offerings`), where('memberId', '==', visitorId));
        const contributionsSnapshot = await getDocs(contributionsQuery);
        contributionsSnapshot.forEach(contributionDoc => {
            batch.delete(contributionDoc.ref);
        });

        await batch.commit();

        toast({
            title: "Visitante Excluído",
            description: "O visitante e todas as suas referências foram removidos com sucesso.",
        });
    } catch (error) {
        console.error("Error deleting visitor and references: ", error);
        toast({
            variant: "destructive",
            title: "Erro ao excluir",
            description: "Não foi possível remover o visitante. Tente novamente.",
        });
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-center md:text-left">Gestão de Visitantes</h1>
        <Button onClick={openSheetForNew} disabled={userLoading || !user}>
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