
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, Receipt, Calendar, CircleDollarSign, Landmark, Info, Tag } from 'lucide-react';
import type { Expense } from '@/components/expense-form';

export default function ExpenseDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const [user] = useAuthState(auth);
  const [expense, setExpense] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(true);

  const expenseId = params.id as string;

  useEffect(() => {
    if (user && expenseId) {
      const expenseDocPath = `users/${user.uid}/expenses/${expenseId}`;
      const unsubscribe = onSnapshot(doc(db, expenseDocPath), (doc) => {
        if (doc.exists()) {
          setExpense({ id: doc.id, ...doc.data() } as Expense);
        } else {
          console.error("No such expense!");
          setExpense(null);
        }
        setLoading(false)
      }, (error) => {
        console.error("Error fetching expense:", error);
        setLoading(false);
      });

      return () => unsubscribe();
    } else if (!user) {
        setLoading(false);
    }
  }, [user, expenseId]);


  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!expense) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center text-center">
        <h2 className="text-2xl font-semibold">Despesa não encontrada</h2>
        <p className="text-muted-foreground">O registro que você está procurando não existe ou foi removido.</p>
        <Button onClick={() => router.push('/dashboard/expenses')} className="mt-4">
          Voltar para Despesas
        </Button>
      </div>
    );
  }

  const expenseDate = new Date(expense.date);

  return (
    <div className="space-y-6">
        <Button variant="outline" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
        </Button>

        <Card>
            <CardHeader>
                <CardTitle className="text-3xl flex items-center gap-2">
                   Detalhes da Despesa
                </CardTitle>
                <CardDescription>
                    Registro de saída de {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(expense.amount)}.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-primary">Informações do Registro</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-center gap-3">
                            <Receipt className="h-4 w-4" />
                            <span>Descrição: {expense.description}</span>
                        </li>
                         <li className="flex items-center gap-3">
                            <CircleDollarSign className="h-4 w-4" />
                            <span>Valor: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(expense.amount)}</span>
                        </li>
                         <li className="flex items-center gap-3">
                            <Calendar className="h-4 w-4" />
                            <span>Data: {expenseDate.toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</span>
                        </li>
                         <li className="flex items-center gap-3">
                            <Tag className="h-4 w-4" />
                            <span>Categoria: {expense.category}</span>
                        </li>
                         <li className="flex items-center gap-3">
                            <Landmark className="h-4 w-4" />
                            <span>Método: {expense.paymentMethod}</span>
                        </li>
                         {expense.observations && (
                            <li className="flex items-start gap-3">
                                <Info className="h-4 w-4 mt-1 flex-shrink-0" />
                                <p className="whitespace-pre-wrap">{expense.observations}</p>
                            </li>
                         )}
                    </ul>
                </div>
            </CardContent>
            <CardFooter>
                 <Button onClick={() => router.push('/dashboard/expenses')}>Fechar Detalhes</Button>
            </CardFooter>
        </Card>
    </div>
  );
}
