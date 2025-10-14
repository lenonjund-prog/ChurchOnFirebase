"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue, SelectSeparator } from "@/components/ui/select";
import type { Service } from "./service-form";
import type { Event } from "./event-form";
import { supabase } from "@/lib/supabase";
import { useSession } from "@/components/supabase-session-provider";


const formSchema = z.object({
  fullName: z.string().min(3, { message: "O nome completo é obrigatório." }),
  phone: z.string().optional(),
  email: z.string().email({ message: "Por favor, insira um email válido." }).optional().or(z.literal('')),
  address: z.string().optional(),
  isChristian: z.enum(["sim", "nao"]),
  denomination: z.string().optional(),
  sourceId: z.string().optional(),
});


type FormValues = z.infer<typeof formSchema>;

export type Visitor = {
    id: string;
    fullName: string;
    phone?: string;
    email?: string;
    address?: string;
    isChristian: "sim" | "nao";
    denomination?: string;
    createdAt: string;
    sourceId?: string;
};

type VisitorFormProps = {
    onFormSubmit: (data: Omit<Visitor, 'id' | 'createdAt'>) => Promise<void>;
    onSheetClose: () => void;
    visitorData?: Visitor | null;
    services: Service[]; // Adicionado services como prop
    events: Event[]; // Adicionado events como prop
};

export function VisitorForm({ onFormSubmit, onSheetClose, visitorData, services, events }: VisitorFormProps) {
    const [loading, setLoading] = useState(false);
    const { user } = useSession();
    
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            fullName: "",
            phone: "",
            email: "",
            address: "",
            isChristian: "nao",
            denomination: "",
            sourceId: "nenhum",
        },
    });

    const isChristian = form.watch("isChristian");

    useEffect(() => {
        if(visitorData) {
            form.reset({
                ...visitorData,
                sourceId: visitorData.sourceId || "nenhum",
            });
        } else {
            form.reset({
                fullName: "",
                phone: "",
                email: "",
                address: "",
                isChristian: "nao",
                denomination: "",
                sourceId: "nenhum",
            });
        }
    }, [visitorData, form.reset]);

  async function onSubmit(data: FormValues) {
    setLoading(true);
    const dataToSubmit = { ...data };
    if (dataToSubmit.isChristian === 'nao') {
      delete dataToSubmit.denomination;
    }
     if (dataToSubmit.sourceId === 'nenhum') {
        dataToSubmit.sourceId = undefined;
      }


    try {
      await onFormSubmit(dataToSubmit as Omit<Visitor, 'id' | 'createdAt'>);
    } catch (error) {
       console.error("Failed to submit form:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-6">
        <div className="space-y-2">
            <Label htmlFor="fullName">Nome Completo</Label>
            <Input id="fullName" placeholder="Nome completo do visitante" {...form.register("fullName")} />
            {form.formState.errors.fullName && <p className="text-sm font-medium text-destructive">{form.formState.errors.fullName.message}</p>}
        </div>

        <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="email@exemplo.com" {...form.register("email")} />
            {form.formState.errors.email && <p className="text-sm font-medium text-destructive">{form.formState.errors.email.message}</p>}
        </div>

        <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input id="phone" type="tel" placeholder="(00) 90000-0000" {...form.register("phone")} />
            {form.formState.errors.phone && <p className="text-sm font-medium text-destructive">{form.formState.errors.phone.message}</p>}
        </div>

        <div className="space-y-2">
            <Label htmlFor="address">Endereço</Label>
            <Input id="address" placeholder="Rua, número, bairro..." {...form.register("address")} />
            {form.formState.errors.address && <p className="text-sm font-medium text-destructive">{form.formState.errors.address.message}</p>}
        </div>

        <div className="space-y-3">
            <Label>Já é cristão?</Label>
            <Controller
                control={form.control}
                name="isChristian"
                render={({ field }) => (
                     <RadioGroup onValueChange={field.onChange} value={field.value} className="flex space-x-4">
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="sim" id="isChristian-sim" />
                            <Label htmlFor="isChristian-sim" className="font-normal">Sim</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="nao" id="isChristian-nao" />
                            <Label htmlFor="isChristian-nao" className="font-normal">Não</Label>
                        </div>
                    </RadioGroup>
                )}
            />
            {form.formState.errors.isChristian && <p className="text-sm font-medium text-destructive">{form.formState.errors.isChristian.message}</p>}
        </div>
        
        {isChristian === 'sim' && (
             <div className="space-y-2">
                <Label htmlFor="denomination">De qual denominação?</Label>
                <Input id="denomination" placeholder="Ex: Batista, Assembleia de Deus..." {...form.register("denomination")} />
                {form.formState.errors.denomination && <p className="text-sm font-medium text-destructive">{form.formState.errors.denomination.message}</p>}
            </div>
        )}

        <div className="space-y-2">
            <Label>Quando nos conheceu?</Label>
            <Controller
                control={form.control}
                name="sourceId"
                render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecione um culto ou evento" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="nenhum">Nenhum / Outro</SelectItem>
                            {(services.length > 0 || events.length > 0) && <SelectSeparator />}
                            {services.length > 0 && (
                                <SelectGroup>
                                    <SelectLabel>Cultos</SelectLabel>
                                    {services.map(service => (
                                        <SelectItem key={service.id} value={`culto_${service.id}`}>{service.name}</SelectItem>
                                    ))}
                                </SelectGroup>
                            )}
                            {events.length > 0 && (
                                <SelectGroup>
                                    <SelectLabel>Eventos</SelectLabel>
                                    {events.map(event => (
                                        <SelectItem key={event.id} value={`evento_${event.id}`}>{event.name}</SelectItem>
                                    ))}
                                </SelectGroup>
                            )}
                        </SelectContent>
                    </Select>
                )}
            />
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