
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Form } from "@/components/ui/form";


const profileFormSchema = z.object({
  firstName: z.string().min(2, { message: "O nome é obrigatório." }),
  lastName: z.string().min(2, { message: "O sobrenome é obrigatório." }),
  phone: z.string().min(10, { message: "O telefone é obrigatório." }),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;

type ProfileFormProps = {
    onFormSubmit: (data: ProfileFormValues) => Promise<void>;
    onSheetClose: () => void;
    profileData?: {
        firstName: string;
        lastName: string;
        phone: string;
    } | null;
};

export function ProfileForm({ onFormSubmit, onSheetClose, profileData }: ProfileFormProps) {
    const [loading, setLoading] = useState(false);
    
    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            phone: "",
        },
    });

    useEffect(() => {
        if(profileData) {
            form.reset(profileData);
        } else {
            form.reset({
                firstName: "",
                lastName: "",
                phone: "",
            });
        }
    }, [profileData, form]);

  async function onSubmit(data: ProfileFormValues) {
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-6">
          <div className="space-y-2">
              <Label htmlFor="firstName">Nome</Label>
              <Input id="firstName" placeholder="Seu nome" {...form.register("firstName")} />
              {form.formState.errors.firstName && <p className="text-sm font-medium text-destructive">{form.formState.errors.firstName.message}</p>}
          </div>

          <div className="space-y-2">
              <Label htmlFor="lastName">Sobrenome</Label>
              <Input id="lastName" placeholder="Seu sobrenome" {...form.register("lastName")} />
              {form.formState.errors.lastName && <p className="text-sm font-medium text-destructive">{form.formState.errors.lastName.message}</p>}
          </div>

           <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input id="phone" placeholder="(00) 90000-0000" {...form.register("phone")} />
              {form.formState.errors.phone && <p className="text-sm font-medium text-destructive">{form.formState.errors.phone.message}</p>}
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
      </Form>
  );
}
