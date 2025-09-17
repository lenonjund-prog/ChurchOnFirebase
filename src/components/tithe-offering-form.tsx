"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue, SelectSeparator } from "@/components/ui/select";
import { Loader2, Calendar as CalendarIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import type { Member } from "./member-form";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar } from "./ui/calendar";
import { Textarea } from "./ui/textarea";
import type { Visitor } from "./visitor-form";
import type { Service } from "./service-form";
import type { Event } from "./event-form";
import { supabase } from "@/lib/supabase";
import { useSession } from "@/components/supabase-session-provider";

const formSchema = z.object({
  memberId: z.string({ required_error: "Selecione o contribuinte." }),
  type: z.enum(["Dízimo", "Oferta"], { required_error: "Selecione o tipo." }),
  amount: z.coerce.number().min(0.01, { message: "O valor deve ser maior que zero." }),
  date: z.string({ required_error: "A data é obrigatória." }),
  method: z.enum(["Dinheiro", "PIX", "Cartão de Crédito", "Cartão de Débito", "Transferência Bancária"], { required_error: "Selecione o método." }),
  observations: z.string().optional(),
  sourceId: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export type TitheOffering = {
    id: string;
    memberId: string;
    type: "Dízimo" | "Oferta";
    amount: number;
    date: string;
    method: "Dinheiro" | "PIX" | "Cartão de Crédito" | "Cartão de Débito" | "Transferência Bancária";
    observations?: string;
    sourceId?: string;
};

type TitheOfferingFormProps = {
    onFormSubmit: (data: Omit<TitheOffering, 'id'>) => Promise<void>;
    onSheetClose: () => void;
    contributionData?: TitheOffering | null;
    members: Member[]; // Adicionado
    visitors: Visitor[]; // Adicionado
    services: Service[]; // Adicionado
    events: Event[]; // Adicionado
};


export function TitheOfferingForm({ onFormSubmit, onSheetClose, contributionData, members, visitors, services, events }: TitheOfferingFormProps) {
    const [loading, setLoading] = useState(false);
    const { user } = useSession();
    // Removido o estado local para members, visitors, services, events, pois agora são props
    
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            memberId: "",
            type: "Oferta",
            amount: 0,
            date: new Date().toISOString(),
            method: "Dinheiro",
            observations: "",
            sourceId: "nenhum",
        },
    });

    // Removido o useEffect que buscava dados relacionados, pois agora são passados como props
    // useEffect(() => {
    //     async function fetchRelatedData() {
    //         if(user) {
    //             // ... fetch logic
    //         }
    //     }
    //     fetchRelatedData();
    // }, [user])

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
        if(contributionData) {
            form.reset({
                ...contributionData,
                amount: contributionData.amount,
                sourceId: contributionData.sourceId || "nenhum",
            });
            const formattedValue = new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
            }).format(contributionData.amount);
            setDisplayValue(formattedValue);
        } else {
            form.reset({
                memberId: "",
                type: "Oferta",
                amount: 0,
                date: new Date().toISOString(),
                method: "Dinheiro",
                observations: "",
                sourceId: "nenhum",
            });
            setDisplayValue("R$ 0,00");
        }
    }, [contributionData, form]);

  async function onSubmit(data: FormValues) {
    setLoading(true);
    try {
      const dataToSubmit = { ...data };
      if (dataToSubmit.sourceId === 'nenhum') {
        dataToSubmit.sourceId = undefined; // Supabase will store null for undefined
      }
      await onFormSubmit(dataToSubmit);
    } catch (error) {
       console.error("Failed to submit form:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-6">
        <div className="space-y-2">
            <Label>Contribuinte</Label>
            <Controller
                control={form.control}
                name="memberId"
                render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecione um membro, visitante ou anônimo" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="anonimo">Anônimo</SelectItem>
                             {(members.length > 0 || visitors.length > 0) && <SelectSeparator />}
                             {members.length > 0 && (
                                <SelectGroup>
                                    <SelectLabel>Membros</SelectLabel>
                                    {members.map(member => (
                                        <SelectItem key={member.id} value={member.id}>{member.fullName} (Membro)</SelectItem>
                                    ))}
                                </SelectGroup>
                            )}
                            {visitors.length > 0 && (
                                <SelectGroup>
                                    <SelectLabel>Visitantes</SelectLabel>
                                    {visitors.map(visitor => (
                                        <SelectItem key={visitor.id} value={visitor.id}>{visitor.fullName} (Visitante)</SelectItem>
                                    ))}
                                </SelectGroup>
                            )}
                        </SelectContent>
                    </Select>
                )}
            />
            {form.formState.errors.memberId && <p className="text-sm font-medium text-destructive">{form.formState.errors.memberId.message}</p>}
        </div>

        <div className="space-y-2">
            <Label>Tipo</Label>
            <Controller
                control={form.control}
                name="type"
                render={({ field }) => (
                     <RadioGroup onValueChange={field.onChange} value={field.value} className="flex space-x-4">
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Dízimo" id="type-dizimo" />
                            <Label htmlFor="type-dizimo" className="font-normal">Dízimo</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Oferta" id="type-oferta" />
                            <Label htmlFor="type-oferta" className="font-normal">Oferta</Label>
                        </div>
                    </RadioGroup>
                )}
            />
            {form.formState.errors.type && <p className="text-sm font-medium text-destructive">{form.formState.errors.type.message}</p>}
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
             <Label>Data</Label>
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
            <Label>Método de Pagamento</Label>
            <Controller
                control={form.control}
                name="method"
                render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecione o método" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                            <SelectItem value="PIX">PIX</SelectItem>
                            <SelectItem value="Cartão de Crédito">Cartão de Crédito</SelectItem>
                            <SelectItem value="Cartão de Débito">Cartão de Débito</SelectItem>
                            <SelectItem value="Transferência Bancária">Transferência Bancária</SelectItem>
                        </SelectContent>
                    </Select>
                )}
            />
            {form.formState.errors.method && <p className="text-sm font-medium text-destructive">{form.formState.errors.method.message}</p>}
        </div>

        <div className="space-y-2">
            <Label>Origem da Contribuição (Opcional)</Label>
            <Controller
                control={form.control}
                name="sourceId"
                render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecione um culto ou evento" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="nenhum">Nenhum</SelectItem>
                            {(services.length > 0 || events.length > 0) && <SelectSeparator />}
                            {services.length > 0 && (
                                <SelectGroup>
                                    <SelectLabel>Cultos</SelectLabel>
                                    {services.map(service => (
                                        <SelectItem key={service.id} value={`culto_${service.id}`}>
                                            {service.name} - {new Date(service.dateTime).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            )}
                             {events.length > 0 && (
                                <SelectGroup>
                                    <SelectLabel>Eventos</SelectLabel>
                                    {events.map(event => (
                                        <SelectItem key={event.id} value={`evento_${event.id}`}>
                                             {event.name} - {new Date(event.dateTime).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                             )}
                        </SelectContent>
                    </Select>
                )}
            />
        </div>

         <div className="space-y-2">
            <Label htmlFor="observations">Observações</Label>
            <Textarea id="observations" placeholder="Alguma observação sobre esta contribuição?" {...form.register("observations")} />
        </div>
        
        <div className="flex gap-4 pt-4">
            <Button type="button" variant="outline" onClick={onSheetClose} className="w-full">
                Cancelar
            </Button>
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar
            </Button>
        </div>
      </form>
  );
}