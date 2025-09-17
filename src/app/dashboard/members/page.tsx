
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
import { Badge } from "@/components/ui/badge";
import { PlusCircle, MoreHorizontal, Loader2, Search } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { MemberForm, type Member } from "@/components/member-form";
import { collection, addDoc, onSnapshot, query, orderBy, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";


export default function MembersPage() {
  const [user, userLoading] = useAuthState(auth);
  const router = useRouter();
  const { toast } = useToast();
  const [members, setMembers] = useState<Member[]>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (user) {
      const membersCollectionPath = `users/${user.uid}/members`;
      const q = query(collection(db, membersCollectionPath), orderBy("joined", "desc"));
      
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const membersData: Member[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          membersData.push({
            id: doc.id,
            ...data,
            joined: data.joined,
          } as Member);
        });
        setMembers(membersData);
        setLoading(false);
      }, (error) => {
        console.error("Error fetching members: ", error);
        toast({
            variant: "destructive",
            title: "Erro ao buscar membros",
            description: "Não foi possível carregar a lista de membros.",
        });
        setLoading(false);
      });

      return () => unsubscribe();
    } else if (!userLoading) {
      setMembers([]);
      setLoading(false);
    }
  }, [user, userLoading, toast]);

  const handleFormSubmit = async (formData: Omit<Member, 'id' | 'joined'>) => {
    if (!user) {
      toast({ variant: "destructive", title: "Erro", description: "Você precisa estar autenticado." });
      return;
    }
    const membersCollectionPath = `users/${user.uid}/members`;

    if (selectedMember) {
      // Update existing member
      const memberDocRef = doc(db, membersCollectionPath, selectedMember.id);
      await updateDoc(memberDocRef, formData);
      toast({ title: "Sucesso!", description: "Membro atualizado com sucesso." });
    } else {
      // Add new member
      await addDoc(collection(db, membersCollectionPath), {
        ...formData,
        joined: new Date().toISOString(),
      });
      toast({ title: "Sucesso!", description: "Membro adicionado com sucesso." });
    }
    
    closeSheet();
  };

  const handleDeleteMember = async (memberId: string) => {
     if (!user) {
      toast({ variant: "destructive", title: "Erro", description: "Você precisa estar autenticado." });
      return;
    }
    try {
        const memberDocRef = doc(db, `users/${user.uid}/members`, memberId);
        await deleteDoc(memberDocRef);
        toast({
            title: "Membro Excluído",
            description: "O membro foi removido com sucesso.",
        });
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Erro ao excluir",
            description: "Não foi possível remover o membro. Tente novamente.",
        });
    }
  }

  const openSheetForNew = () => {
    setSelectedMember(null);
    setIsSheetOpen(true);
  }

  const openSheetForEdit = (member: Member) => {
    setSelectedMember(member);
    setIsSheetOpen(true);
  }
  
  const closeSheet = () => {
    setIsSheetOpen(false);
    setSelectedMember(null);
  }

  const filteredMembers = members.filter((member) =>
    member.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-center md:text-left">Gestão de Membros</h1>
        <Button onClick={openSheetForNew} disabled={userLoading || !user}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Adicionar Membro
        </Button>
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
            <SheetHeader>
                <SheetTitle>{selectedMember ? 'Editar Membro' : 'Adicionar Novo Membro'}</SheetTitle>
                <SheetDescription>
                {selectedMember ? 'Atualize os detalhes do membro abaixo.' : 'Preencha os detalhes abaixo para cadastrar um novo membro.'}
                </SheetDescription>
            </SheetHeader>
            <MemberForm 
                onFormSubmit={handleFormSubmit}
                onSheetClose={closeSheet}
                memberData={selectedMember} 
            />
        </SheetContent>
      </Sheet>


      <Card>
        <CardHeader>
          <CardTitle>Lista de Membros</CardTitle>
          <CardDescription>Visualize e gerencie as informações dos membros.</CardDescription>
          <div className="relative pt-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead className="hidden md:table-cell">Email</TableHead>
                <TableHead className="hidden lg:table-cell">Telefone</TableHead>
                <TableHead className="hidden md:table-cell">Membro Desde</TableHead>
                <TableHead>Status</TableHead>
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
                       <span>Carregando membros...</span>
                     </div>
                  </TableCell>
                </TableRow>
              ) : filteredMembers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24">
                    {searchQuery ? `Nenhum membro encontrado para "${searchQuery}".` : "Nenhum membro encontrado. Comece a adicionar novos membros!"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">{member.fullName}</TableCell>
                    <TableCell className="hidden md:table-cell">{member.email}</TableCell>
                    <TableCell className="hidden lg:table-cell">{member.phone}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {new Date(member.joined).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                    </TableCell>
                    <TableCell>
                      <Badge variant={member.status === 'Ativo' ? 'secondary' : 'outline'}>
                        {member.status}
                      </Badge>
                    </TableCell>
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
                               <Link href={`/dashboard/members/${member.id}`}>Ver Perfil</Link>
                           </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => openSheetForEdit(member)}>Editar</DropdownMenuItem>
                          <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">Excluir</DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Essa ação não pode ser desfeita. Isso excluirá permanentemente o membro
                                            <span className="font-semibold"> {member.fullName} </span>
                                             e removerá seus dados de nossos servidores.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDeleteMember(member.id)}>Excluir</AlertDialogAction>
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
