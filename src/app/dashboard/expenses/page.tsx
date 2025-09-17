
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
import { collection, addDoc, onSnapshot, query, orderBy, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";


export default function ExpensesPage() {
  const [user, userLoading] = useAuthState(auth);
  const { toast } = useToast();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  useEffect(() => {
    if (user) {
      const expensesCollectionPath = `users/${user.uid}/expenses`;
      const q = query(collection(db, expensesCollectionPath), orderBy("date", "desc"));

      const unsubscribe = onSnapshot(q, (snapshot) => {
          setExpenses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Expense)));
          setLoading(false);
      }, (error) => {
          console.error("Error fetching expenses: ", error);
          toast({ variant: "destructive", title: "Erro ao buscar despesas" });
          setLoading(false);
      });
      return () => unsubscribe();
    } else if (!userLoading) {
      setExpenses([]);
      setLoading(false);
    }
  }, [user, userLoading, toast]);


  const handleFormSubmit = async (formData: Omit<Expense, 'id'>) => {
    if (!user) {
      toast({ variant: "destructive", title: "Erro", description: "Você precisa estar autenticado." });
      return;
    }
    const collectionPath = `users/${user.uid}/expenses`;

    if (selectedExpense) {
      const docRef = doc(db, collectionPath, selectedExpense.id);
      await updateDoc(docRef, formData);
      toast({ title: "Sucesso!", description: "Despesa atualizada com sucesso." });
    } else {
      await addDoc(collection(db, collectionPath), formData);
      toast({ title: "Sucesso!", description: "Despesa registrada com sucesso." });
    }
    
    closeSheet();
  };

  const handleDelete = async (id: string) => {
     if (!user) {
      toast({ variant: "destructive", title: "Erro", description: "Você precisa estar autenticado." });
      return;
    }
    try {
        const docRef = doc(db, `users/${user.uid}/expenses`, id);
        await deleteDoc(docRef);
        toast({
            title: "Registro Excluído",
            description: "A despesa foi removida com sucesso.",
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-center md:text-left">Saídas e Despesas</h1>
        <Button onClick={openSheetForNew} disabled={userLoading || !user}>
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
                       <span>Carregando despesas...</span>
                     </div>
                  </TableCell>
                </TableRow>
              ) : expenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">
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
