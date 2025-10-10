'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Loader2, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useSession } from '@/components/supabase-session-provider';
import { StripePaymentSheet } from '@/components/stripe-payment-sheet'; // Importar o componente StripePaymentSheet

// Certifique-se de que o tipo para o elemento customizado esteja disponível
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'stripe-buy-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        'buy-button-id': string;
        'publishable-key': string;
        'client-reference-id'?: string; // Adicionado para passar o userId
      };
    }
  }
}

const plans = [
  {
    name: 'Experimental',
    price: 'Grátis',
    period: '/ 14 dias',
    description: 'Teste todos os recursos premium gratuitamente.',
    features: ['Gestão de Membros', 'Gestão de Eventos', 'Controle Financeiro', 'Relatórios Básicos'],
    amount: 0, // No amount for experimental
    internalPlanId: 'Experimental', // Internal ID for mapping
  },
  {
    name: 'Mensal',
    price: 'R$ 59,90',
    period: '/ mês',
    description: 'Acesso completo a todos os recursos da plataforma.',
    features: ['Todos os recursos do plano Experimental', 'Suporte Prioritário', 'Comunicação via Email/SMS', 'Relatórios Avançados'],
    amount: 59.90, // Amount for monthly plan
    internalPlanId: 'Mensal', // Internal ID for mapping
  },
  {
    name: 'Anual',
    price: 'R$ 600,00',
    period: '/ ano',
    description: 'Economize com o plano anual e tenha acesso a tudo por um ano inteiro.',
    features: ['Todos os recursos do plano Mensal', 'Desconto de 2 meses', 'Acesso antecipado a novos recursos'],
    amount: 600.00, // Amount for annual plan
    internalPlanId: 'Anual', // Internal ID for mapping
  },
];

export default function SubscriptionsPage() {
  const { user, loading: sessionLoading } = useSession();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentPlan, setCurrentPlan] = useState('Experimental'); // Default to Experimental
  const [trialDaysLeft, setTrialDaysLeft] = useState<number | null>(null);
  const [pageLoading, setPageLoading] = useState(true);

  const [isPaymentSheetOpen, setIsPaymentSheetOpen] = useState(false);
  const [selectedPlanForPayment, setSelectedPlanForPayment] = useState<{ name: string; amount: number; } | null>(null);

  useEffect(() => {
    async function fetchUserSubscription() {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('active_plan, created_at')
            .eq('id', user.id)
            .single();

          if (error) {
            console.error("Error fetching user data:", error);
            toast({ variant: 'destructive', title: 'Erro ao carregar informações do plano.' });
            setCurrentPlan('Experimental'); // Default fallback
            setTrialDaysLeft(0);
          } else if (data) {
              const activePlan = data.active_plan || 'Experimental'; // Ensure default is Experimental
              setCurrentPlan(activePlan);
              
              if (activePlan === 'Experimental' && data.created_at) {
                  const creationDate = new Date(data.created_at);
                  const today = new Date();
                  const diffTime = today.getTime() - creationDate.getTime();
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  const daysLeft = 14 - diffDays;
                  setTrialDaysLeft(daysLeft > 0 ? daysLeft : 0);
                  
                  if (daysLeft <= 0) {
                      setCurrentPlan('Experimental'); // Explicitly set to Experimental if trial expired
                  }
              } else {
                  setTrialDaysLeft(0);
              }
          } else {
             setTrialDaysLeft(0);
             setCurrentPlan('Experimental'); // Default if no profile data
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          toast({ variant: 'destructive', title: 'Erro ao carregar informações do plano.' });
        } finally {
          setPageLoading(false);
        }
      } else if (!sessionLoading) {
          setPageLoading(false);
      }
    }

    fetchUserSubscription();
  }, [user, sessionLoading, toast]);

  // Handle Stripe payment success/failure from return_url
  useEffect(() => {
    const paymentSuccess = searchParams.get('payment_success');
    if (paymentSuccess === 'true') {
      toast({
        title: "Pagamento realizado com sucesso!",
        description: "Seu plano foi atualizado. Pode levar alguns instantes para refletir.",
      });
      router.replace('/dashboard/subscriptions', undefined);
      setPageLoading(true); // Trigger re-fetch
    } else if (paymentSuccess === 'false') {
      toast({
        variant: "destructive",
        title: "Pagamento cancelado ou falhou",
        description: "Não foi possível processar seu pagamento. Por favor, tente novamente.",
      });
      router.replace('/dashboard/subscriptions', undefined);
    }
  }, [searchParams, toast, router]);

  const handleOpenPaymentSheet = (plan: { name: string; amount: number; }) => {
    setSelectedPlanForPayment(plan);
    setIsPaymentSheetOpen(true);
  };

  const handlePaymentSheetClose = () => {
    setIsPaymentSheetOpen(false);
    setSelectedPlanForPayment(null);
    setPageLoading(true); // Re-fetch subscription status after sheet closes
  };

  if (pageLoading || sessionLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Assinaturas</h1>
        <p className="text-muted-foreground mt-2">Escolha o plano que melhor se adapta às necessidades da sua igreja.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={cn('flex flex-col', {
              'border-primary ring-2 ring-primary': currentPlan === plan.internalPlanId,
            })}
          >
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <div className="flex items-baseline">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground ml-1">{plan.period}</span>
              </div>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
              {plan.name === 'Experimental' && trialDaysLeft !== null && trialDaysLeft > 0 && (
                 <div className="text-center bg-primary/10 text-primary p-3 rounded-lg">
                    <p className="font-semibold">Você está no período de teste.</p>
                    <p>Restam <span className="font-bold">{trialDaysLeft}</span> dia(s).</p>
                  </div>
              )}
               {plan.name === 'Experimental' && trialDaysLeft === 0 && currentPlan !== 'Experimental' && (
                  <div className="text-center bg-destructive/10 text-destructive p-3 rounded-lg">
                      <p className='font-semibold'>Seu período de teste expirou.</p>
                  </div>
              )}
              <p className="font-semibold">Recursos incluídos:</p>
              <ul className="space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="flex-col gap-4">
              {currentPlan === plan.internalPlanId ? (
                 <Button className="w-full" disabled>
                    <Star className="mr-2 h-4 w-4" />
                    Plano Atual
                  </Button>
              ) : (
                <>
                  {plan.amount > 0 && user && ( // Only show button for paid plans
                    <div className="w-full flex flex-col items-center gap-2">
                      <Button 
                        className="w-full" 
                        onClick={() => handleOpenPaymentSheet({ name: plan.name, amount: plan.amount })}
                      >
                        Assinar {plan.name}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
       <div className="text-center text-sm text-muted-foreground">
            <p>Os pagamentos são processados de forma segura. Você pode cancelar ou alterar seu plano a qualquer momento.</p>
      </div>

      {user && selectedPlanForPayment && (
        <StripePaymentSheet
          isOpen={isPaymentSheetOpen}
          onOpenChange={handlePaymentSheetClose}
          appName="ChurchOn" // Passando o nome do aplicativo
          planName={selectedPlanForPayment.name}
          amount={selectedPlanForPayment.amount}
          userId={user.id}
        />
      )}
    </div>
  );
}