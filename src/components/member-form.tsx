
"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";


const formSchema = z.object({
  fullName: z.string().min(3, { message: "O nome completo é obrigatório." }),
  phone: z.string().min(10, { message: "O telefone é obrigatório." }),
  email: z.string().email({ message: "Por favor, insira um email válido." }),
  address: z.string().min(5, { message: "O endereço é obrigatório." }),
  isBaptized: z.enum(["sim", "nao"], {
    required_error: "Você precisa selecionar uma opção.",
  }),
  status: z.enum(["Ativo", "Inativo"], {
      required_error: "Selecione o status do membro"
  }),
  role: z.enum(["Membro", "Líder", "Pastor"], {
    required_error: "Você precisa selecionar uma função.",
  }),
});

type FormValues = z.infer<typeof formSchema>;

export type Member = {
    id: string;
    fullName: string;
    phone: string;
    email: string;
    address: string;
    isBaptized: "sim" | "nao";
    status: "Ativo" | "Inativo";
    role: "Membro" | "Líder" | "Pastor";
    joined: string;
};

type MemberFormProps = {
    onFormSubmit: (data: Omit<Member, 'id' | 'joined'>) => Promise<void>;
    onSheetClose: () => void;
    memberData?: Member | null;
};


export function MemberForm({ onFormSubmit, onSheetClose, memberData }: MemberFormProps) {
    const [loading, setLoading] = useState(false);
    
    const { register, handleSubmit, control, reset, formState: { errors } } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            fullName: "",
            phone: "",
            email: "",
            address: "",
            isBaptized: "nao",
            status: "Ativo",
            role: "Membro",
        },
    });

    useEffect(() => {
        if(memberData) {
            reset(memberData);
        } else {
            reset({
                fullName: "",
                phone: "",
                email: "",
                address: "",
                isBaptized: "nao",
                status: "Ativo",
                role: "Membro",
            });
        }
    }, [memberData, reset]);

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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-6">
        <div className="space-y-2">
            <Label htmlFor="fullName">Nome Completo</Label>
            <Input id="fullName" placeholder="Nome completo do membro" {...register("fullName")} />
            {errors.fullName && <p className="text-sm font-medium text-destructive">{errors.fullName.message}</p>}
        </div>

        <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="email@exemplo.com" {...register("email")} />
            {errors.email && <p className="text-sm font-medium text-destructive">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input id="phone" type="tel" placeholder="(00) 90000-0000" {...register("phone")} />
            {errors.phone && <p className="text-sm font-medium text-destructive">{errors.phone.message}</p>}
        </div>

        <div className="space-y-2">
            <Label htmlFor="address">Endereço</Label>
            <Input id="address" placeholder="Rua, número, bairro..." {...register("address")} />
            {errors.address && <p className="text-sm font-medium text-destructive">{errors.address.message}</p>}
        </div>

        <div className="space-y-3">
            <Label>É Batizado?</Label>
            <Controller
                control={control}
                name="isBaptized"
                render={({ field }) => (
                     <RadioGroup onValueChange={field.onChange} value={field.value} className="flex space-x-4">
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="sim" id="isBaptized-sim" />
                            <Label htmlFor="isBaptized-sim" className="font-normal">Sim</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="nao" id="isBaptized-nao" />
                            <Label htmlFor="isBaptized-nao" className="font-normal">Não</Label>
                        </div>
                    </RadioGroup>
                )}
            />
            {errors.isBaptized && <p className="text-sm font-medium text-destructive">{errors.isBaptized.message}</p>}
        </div>

         <div className="space-y-2">
            <Label>Função</Label>
            <Controller
                control={control}
                name="role"
                render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecione a função do membro" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Membro">Membro</SelectItem>
                            <SelectItem value="Líder">Líder</SelectItem>
                            <SelectItem value="Pastor">Pastor</SelectItem>
                        </SelectContent>
                    </Select>
                )}
            />
            {errors.role && <p className="text-sm font-medium text-destructive">{errors.role.message}</p>}
        </div>

        <div className="space-y-2">
            <Label>Status</Label>
            <Controller
                control={control}
                name="status"
                render={({ field }) => (
                     <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecione o status do membro" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Ativo">Ativo</SelectItem>
                            <SelectItem value="Inativo">Inativo</SelectItem>
                        </SelectContent>
                    </Select>
                )}
            />
            {errors.status && <p className="text-sm font-medium text-destructive">{errors.status.message}</p>}
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
