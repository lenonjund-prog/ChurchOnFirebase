
"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { collection, getDocs, query } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import type { Member } from "./member-form";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";


const formSchema = z.object({
  name: z.string().min(3, { message: "O nome do culto é obrigatório." }),
  dateTime: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Data e hora inválidas."}),
  preacher: z.string().optional(),
  theme: z.string().optional(),
  observations: z.string().optional(),
  presentMembers: z.array(z.string()).optional(),
  presentVisitors: z.array(z.string()).optional(),
});


type FormValues = z.infer<typeof formSchema>;

export type Service = {
    id: string;
    name: string;
    dateTime: string;
    preacher: string;
    theme: string;
    observations?: string;
    presentMembers?: string[];
    presentVisitors?: string[];
};

type ServiceFormProps = {
    onFormSubmit: (data: Omit<Service, 'id'>) => Promise<void>;
    onSheetClose: () => void;
    serviceData?: Service | null;
};

export function ServiceForm({ onFormSubmit, onSheetClose, serviceData }: ServiceFormProps) {
    const [loading, setLoading] = useState(false);
    const [user] = useAuthState(auth);
    const [members, setMembers] = useState<Member[]>([]);
    
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            dateTime: new Date().toISOString().substring(0,16),
            preacher: "",
            theme: "",
            observations: "",
            presentMembers: [],
        },
    });

    useEffect(() => {
        async function fetchPeople() {
            if(user) {
                const membersQuery = query(collection(db, `users/${user.uid}/members`));
                const membersSnapshot = await getDocs(membersQuery);
                setMembers(membersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Member)));
            }
        }
        fetchPeople();
    }, [user])

    useEffect(() => {
        if(serviceData) {
            form.reset({
                ...serviceData,
                dateTime: new Date(serviceData.dateTime).toISOString().substring(0,16),
                presentMembers: serviceData.presentMembers || [],
            });
        } else {
            form.reset({
               name: "",
               dateTime: new Date().toISOString().substring(0,16),
               preacher: "",
               theme: "",
               observations: "",
               presentMembers: [],
            });
        }
    }, [serviceData, form]);

  async function onSubmit(data: FormValues) {
    setLoading(true);
    try {
      await onFormSubmit(data as Omit<Service, 'id'>);
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
              <Label htmlFor="name">Nome do Culto</Label>
              <Input id="name" placeholder="Ex: Culto de Domingo" {...form.register("name")} />
              {form.formState.errors.name && <p className="text-sm font-medium text-destructive">{form.formState.errors.name.message}</p>}
          </div>

          <div className="space-y-2">
              <Label htmlFor="dateTime">Data e Hora</Label>
              <Input id="dateTime" type="datetime-local" {...form.register("dateTime")} />
              {form.formState.errors.dateTime && <p className="text-sm font-medium text-destructive">{form.formState.errors.dateTime.message}</p>}
          </div>

          <div className="space-y-2">
              <Label htmlFor="preacher">Pregador(a)</Label>
              <Input id="preacher" placeholder="Nome do pregador" {...form.register("preacher")} />
              {form.formState.errors.preacher && <p className="text-sm font-medium text-destructive">{form.formState.errors.preacher.message}</p>}
          </div>

          <div className="space-y-2">
              <Label htmlFor="theme">Tema da Mensagem</Label>
              <Input id="theme" placeholder="Tema central do sermão" {...form.register("theme")} />
              {form.formState.errors.theme && <p className="text-sm font-medium text-destructive">{form.formState.errors.theme.message}</p>}
          </div>
          
          <div className="space-y-2">
              <Label htmlFor="observations">Observações</Label>
              <Textarea id="observations" placeholder="Detalhes adicionais, ordem do culto, etc." {...form.register("observations")} />
              {form.formState.errors.observations && <p className="text-sm font-medium text-destructive">{form.formState.errors.observations.message}</p>}
          </div>

          <Card>
              <CardHeader>
                  <CardTitle>Membros Presentes</CardTitle>
              </CardHeader>
              <CardContent>
                  <ScrollArea className="h-64">
                  <div className="space-y-2">
                      {members.map(member => (
                          <FormField
                              key={member.id}
                              control={form.control}
                              name="presentMembers"
                              render={({ field }) => {
                                  return (
                                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                      <FormControl>
                                      <Checkbox
                                          checked={field.value?.includes(member.id)}
                                          onCheckedChange={(checked) => {
                                          return checked
                                              ? field.onChange([...(field.value || []), member.id])
                                              : field.onChange(
                                                  field.value?.filter(
                                                  (value) => value !== member.id
                                                  )
                                              )
                                          }}
                                      />
                                      </FormControl>
                                      <FormLabel className="font-normal">
                                          {member.fullName}
                                      </FormLabel>
                                  </FormItem>
                                  )
                              }}
                          />
                      ))}
                  </div>
                  </ScrollArea>
              </CardContent>
          </Card>
          
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
