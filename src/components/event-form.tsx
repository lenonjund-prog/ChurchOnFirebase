
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
  Form
} from "@/components/ui/form";


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
