
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
import { collection, addDoc, onSnapshot, query, orderBy, doc, updateDoc, deleteDoc, getDocs } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useToast } from "@/hooks/use-toast";
import type { Member } from "@/components/member-form";
import type { Visitor } from "@/components/visitor-form";
import type { Service } from "@/components/service-form";
import type { Event } from "@/components/event-form";
import Link from "next/link";


export default function TithesAndOfferingsPage() {
  const [user, userLoading] = useAuthState(auth);
  const { toast } = useToast();
  const [contributions, setContributions] = useState<(TitheOffering & { id: string })[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedContribution, setSelectedContribution] = useState<(TitheOffering & { id: string }) | null>(null);
  
  const people = [
    ...members.map(m => ({ ...m, type: 'Membro' })),
    ...visitors.map(v => ({ ...v, type: 'Visitante' }))
  ];

  const sources = [
    ...services.map(s => ({ ...s, source_type: 'Culto' })),
    ...events.map(e => ({ ...e, source_type: 'Evento' }))
  ];


  useEffect(() => {
    if (user) {
      const paths = {
        contributions: `users/${user.uid}/tithes-offerings`,
        members: `users/${user.uid}/members`,
        visitors: `users/${user.uid}/visitors`,
        services: `users/${user.uid}/services`,
        events: `users/${user.uid}/events`,
      };

      const contributionsQuery = query(collection(db, paths.contributions), orderBy("date", "desc"));
      const membersQuery = query(collection(db, paths.members));
      const visitorsQuery = query(collection(db, paths.visitors));
      const servicesQuery = query(collection(db, paths.services));
      const eventsQuery = query(collection(db, paths.events));

      const unsubscribes = [
        onSnapshot(contributionsQuery, (snapshot) => {
            setContributions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TitheOffering & { id: string })));
            setLoading(false);
        }, (error) => {
            console.error("Error fetching contributions: ", error);
            toast({ variant: "destructive", title: "Erro ao buscar contribuições" });
            setLoading(false);
        }),
        onSnapshot(membersQuery, (snapshot) => {
            setMembers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Member)));
        }),
        onSnapshot(visitorsQuery, (snapshot) => {
            setVisitors(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Visitor)));
        }),
        onSnapshot(servicesQuery, (snapshot) => {
            setServices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service)));
        }),
        onSnapshot(eventsQuery, (snapshot) => {
            setEvents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Event)));
        }),
      ];

      return () => unsubscribes.forEach(unsub => unsub());
    } else if (!userLoading) {
      setContributions([]);
      setMembers([]);
      setVisitors([]);
      setServices([]);
      setEvents([]);
      setLoading(false);
    }
  }, [user, userLoading, toast]);


  const handleFormSubmit = async (formData: Omit<TitheOffering, 'id'>) => {
    if (!user) {
      toast({ variant: "destructive", title: "Erro", description: "Você precisa estar autenticado." });
      return;
    }
    const collectionPath = `users/${user.uid}/tithes-offerings`;

    if (selectedContribution) {
      const docRef = doc(db, collectionPath, selectedContribution.id);
      await updateDoc(docRef, formData);
      toast({ title: "Sucesso!", description: "Contribuição atualizada com sucesso." });
    } else {
      await addDoc(collection(db, collectionPath), formData);
      toast({ title: "Sucesso!", description: "Contribuição adicionada com sucesso." });
    }
    
    closeSheet();
  };

  const handleDelete = async (id: string) => {
     if (!user) {
      toast({ variant: "destructive", title: "Erro", description: "Você precisa estar autenticado." });
      return;
    }
    try {
        const docRef = doc(db, `users/${user.uid}/tithes-offerings`, id);
        await deleteDoc(docRef);
        toast({
            title: "Registro Excluído",
            description: "A contribuição foi removida com sucesso.",
        });
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Erro ao excluir",
            description: "Não foi possível remover o registro. Tente novamente.",
        });
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

  const getSourceName = (sourceId?: string) => {
    if (!sourceId) return 'N/A';
    const [type, id] = sourceId.split('_');
    const collection = type === 'culto' ? services : events;
    const source = collection.find(s => s.id === id);
    return source ? `${source.name} (${type.charAt(0).toUpperCase() + type.slice(1)})` : 'Origem desconhecida';
  }


  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-center md:text-left">Dízimos e Ofertas</h1>
        <Button onClick={openSheetForNew} disabled={userLoading || !user}>
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
                services={services}
                events={events}
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
