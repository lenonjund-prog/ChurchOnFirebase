
"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Calendar as CalendarIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar } from "./ui/calendar";
import { Textarea } from "./ui/textarea";

const formSchema = z.object({
  description: z.string().min(3, { message: "A descrição é obrigatória." }),
  amount: z.coerce.number().min(0.01, { message: "O valor deve ser maior que zero." }),
  date: z.string({ required_error: "A data é obrigatória." }),
  category: z.string({ required_error: "A categoria é obrigatória" }),
  paymentMethod: z.enum(["Dinheiro", "PIX", "Boleto", "Transferência Bancária", "Débito", "Crédito"], { required_error: "Selecione o método." }),
  observations: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export type Expense = {
    id: string;
    description: string;
    amount: number;
    date: string;
    category: string;
    paymentMethod: "Dinheiro" | "PIX" | "Boleto" | "Transferência Bancária" | "Débito" | "Crédito";
    observations?: string;
};

type ExpenseFormProps = {
    onFormSubmit: (data: Omit<Expense, 'id'>) => Promise<void>;
    onSheetClose: () => void;
    expenseData?: Expense | null;
};


export function ExpenseForm({ onFormSubmit, onSheetClose, expenseData }: ExpenseFormProps) {
    const [loading, setLoading] = useState(false);
    
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            description: "",
            amount: 0,
            date: new Date().toISOString(),
            category: "",
            paymentMethod: "Dinheiro",
            observations: "",
        },
    });

    const [displayValue, setDisplayValue] = useState("R$ 0,00");

     const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/\D/g, "");
        if (!rawValue) {
            form.setValue("amount", 0);
            setDisplayValue("R$ 0,00");
            return;
        }

        const numericValue = parseInt(rawValue, 10) / 100;
        form.setValue("amount", numericValue, { shouldValidate: true });

        const formattedValue = new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(numericValue);

        setDisplayValue(formattedValue);
    };

    useEffect(() => {
        if(expenseData) {
            form.reset({
                ...expenseData
            });
            const formattedValue = new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
            }).format(expenseData.amount);
            setDisplayValue(formattedValue);
        } else {
            form.reset({
                description: "",
                amount: 0,
                date: new Date().toISOString(),
                category: "",
                paymentMethod: "Dinheiro",
                observations: "",
            });
            setDisplayValue("R$ 0,00");
        }
    }, [expenseData, form]);

  async function onSubmit(data: FormValues) {
    setLoading(true);
    try {
      await onFormSubmit(data);
    } catch (error) {
       console.error("Failed to submit form:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-6">
        <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input id="description" placeholder="Ex: Conta de luz, material de limpeza..." {...form.register("description")} />
            {form.formState.errors.description && <p className="text-sm font-medium text-destructive">{form.formState.errors.description.message}</p>}
        </div>

        <div className="space-y-2">
            <Label htmlFor="amount">Valor</Label>
            <Input 
                id="amount" 
                type="text"
                placeholder="R$ 0,00"
                value={displayValue}
                onChange={handleAmountChange}
            />
            {form.formState.errors.amount && <p className="text-sm font-medium text-destructive">{form.formState.errors.amount.message}</p>}
        </div>

        <div className="space-y-2">
             <Label>Data da Despesa</Label>
             <Controller
                control={form.control}
                name="date"
                render={({ field }) => (
                    <Popover>
                        <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(new Date(field.value), "dd/MM/yyyy") : <span>Selecione uma data</span>}
                        </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                        <Calendar
                            mode="single"
                            selected={new Date(field.value)}
                            onSelect={(date) => field.onChange(date?.toISOString())}
                            initialFocus
                        />
                        </PopoverContent>
                    </Popover>
                )}
            />
            {form.formState.errors.date && <p className="text-sm font-medium text-destructive">{form.formState.errors.date.message}</p>}
        </div>
        
        <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Input id="category" placeholder="Ex: Administrativa, Manutenção, Eventos..." {...form.register("category")} />
            {form.formState.errors.category && <p className="text-sm font-medium text-destructive">{form.formState.errors.category.message}</p>}
        </div>
        
         <div className="space-y-2">
            <Label>Método de Pagamento</Label>
            <Controller
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecione o método" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                            <SelectItem value="PIX">PIX</SelectItem>
                            <SelectItem value="Boleto">Boleto</SelectItem>
                            <SelectItem value="Transferência Bancária">Transferência Bancária</SelectItem>
                            <SelectItem value="Débito">Cartão de Débito</SelectItem>
                            <SelectItem value="Crédito">Cartão de Crédito</SelectItem>
                        </SelectContent>
                    </Select>
                )}
            />
            {form.formState.errors.paymentMethod && <p className="text-sm font-medium text-destructive">{form.formState.errors.paymentMethod.message}</p>}
        </div>

         <div className="space-y-2">
            <Label htmlFor="observations">Observações</Label>
            <Textarea id="observations" placeholder="Alguma observação sobre esta despesa?" {...form.register("observations")} />
        </div>
        
        <div className="flex gap-4 pt-4">
            <Button type="button" variant="outline" onClick={onSheetClose} className="w-full">
                Cancelar
            </Button>
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar Despesa
            </Button>
        </div>
      </form>
  );
}
