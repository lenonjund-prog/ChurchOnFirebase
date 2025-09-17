"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import { supabase } from "@/lib/supabase";
import { useSession } from "@/components/supabase-session-provider";
import type { Visitor } from "./visitor-form";


const formSchema = z.object({
  name: z.string().min(3, { message: "O nome do evento é obrigatório." }),
  dateTime: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Data e hora inválidas."}),
  information: z.string().optional(),
  presentVisitors: z.array(z.string()).optional(),
});


type FormValues = z.infer<typeof formSchema>;

export type Event = {
    id: string;
    name: string;
    dateTime: string;
    information?: string;
    presentVisitors?: string[];
};

type EventFormProps = {
    onFormSubmit: (data: Omit<Event, 'id'>) => Promise<void>;
    onSheetClose: () => void;
    eventData?: Event | null;
};

export function EventForm({ onFormSubmit, onSheetClose, eventData }: EventFormProps) {
    const [loading, setLoading] = useState(false);
    const { user } = useSession();
    const [visitors, setVisitors] = useState<Visitor[]>([]);
    
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            dateTime: new Date().toISOString().substring(0,16),
            information: "",
            presentVisitors: [],
        },
    });

    useEffect(() => {
        async function fetchVisitors() {
            if(user) {
                const { data, error } = await supabase
                    .from('visitors')
                    .select('*')
                    .eq('user_id', user.id);
                if (error) {
                    console.error("Error fetching visitors:", error);
                } else {
                    setVisitors(data.map(v => ({
                        id: v.id,
                        fullName: v.full_name,
                        phone: v.phone,
                        email: v.email,
                        address: v.address,
                        isChristian: v.is_christian,
                        denomination: v.denomination,
                        createdAt: v.created_at,
                        sourceId: v.source_id,
                    } as Visitor)));
                }
            }
        }
        fetchVisitors();
    }, [user])

    useEffect(() => {
        if(eventData) {
            form.reset({
                ...eventData,
                dateTime: new Date(eventData.dateTime).toISOString().substring(0,16),
                presentVisitors: eventData.presentVisitors || [],
            });
        } else {
            form.reset({
               name: "",
               dateTime: new Date().toISOString().substring(0,16),
               information: "",
               presentVisitors: [],
            });
        }
    }, [eventData, form]);

  async function onSubmit(data: FormValues) {
    setLoading(true);
    try {
      await onFormSubmit(data as Omit<Event, 'id'>);
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
              <Label htmlFor="name">Nome do Evento</Label>
              <Input id="name" placeholder="Ex: Acampamento de Jovens" {...form.register("name")} />
              {form.formState.errors.name && <p className="text-sm font-medium text-destructive">{form.formState.errors.name.message}</p>}
          </div>

          <div className="space-y-2">
              <Label htmlFor="dateTime">Data e Hora</Label>
              <Input id="dateTime" type="datetime-local" {...form.register("dateTime")} />
              {form.formState.errors.dateTime && <p className="text-sm font-medium text-destructive">{form.formState.errors.dateTime.message}</p>}
          </div>
          
          <div className="space-y-2">
              <Label htmlFor="information">Informações</Label>
              <Textarea id="information" placeholder="Detalhes adicionais sobre o evento..." {...form.register("information")} />
              {form.formState.errors.information && <p className="text-sm font-medium text-destructive">{form.formState.errors.information.message}</p>}
          </div>

          <Card>
              <CardHeader>
                  <CardTitle>Visitantes Presentes</CardTitle>
              </CardHeader>
              <CardContent>
                  <ScrollArea className="h-64">
                  <div className="space-y-2">
                      {visitors.length === 0 ? (
                          <p className="text-muted-foreground">Nenhum visitante cadastrado.</p>
                      ) : (
                          visitors.map(visitor => (
                              <FormField
                                  key={visitor.id}
                                  control={form.control}
                                  name="presentVisitors"
                                  render={({ field }) => {
                                      return (
                                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                          <FormControl>
                                          <Checkbox
                                              checked={field.value?.includes(visitor.id)}
                                              onCheckedChange={(checked) => {
                                              return checked
                                                  ? field.onChange([...(field.value || []), visitor.id])
                                                  : field.onChange(
                                                      field.value?.filter(
                                                      (value) => value !== visitor.id
                                                      )
                                                  )
                                              }}
                                          />
                                          </FormControl>
                                          <FormLabel className="font-normal">
                                              {visitor.fullName}
                                          </FormLabel>
                                      </FormItem>
                                      )
                                  }}
                              />
                          ))
                      )}
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
                  Salvar Evento
              </Button>
          </div>
        </form>
      </Form>
  );
}