'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation'; // Importar useRouter e useSearchParams
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Loader2, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useSession } from '@/components/supabase-session-provider';
import { MercadoPagoCheckoutSheet } from '@/components/mercadopago-checkout-sheet';
import { StripePaymentSheet } from '@/components/stripe-payment-sheet'; // Import the new Stripe sheet

const plans = [
  {
    name: 'Experimental',
    price: 'Grátis',
    period: '/ 14 dias',
    description: 'Teste todos os recursos premium gratuitamente.',
    features: ['Gestão de Membros', 'Gestão de Eventos', 'Controle Financeiro', 'Relatórios Básicos'],
    getLink: (userId: string) => '', // No link for experimental
    preapprovalPlanId: 'Experimental', // Internal ID for mapping
  },
  {
    name: 'Mensal',
    price: 'R$ 59,90',
    period: '/ mês',
    description: 'Acesso completo a todos os recursos da plataforma.',
    features: ['Todos os recursos do plano Experimental', 'Suporte Prioritário', 'Comunicação via Email/SMS', 'Relatórios Avançados'],
    // For Stripe Elements, we don't need a direct link here, but a way to identify the plan
    getLink: (userId: string) => 'stripe-monthly', // Placeholder to identify Stripe monthly plan
    preapprovalPlanId: 'Stripe_Mensal', // Internal ID for mapping
  },
  {
    name: 'Anual',
    price: 'R$ 600,00',
    period: '/ ano',
    description: 'Economize com o plano anual e tenha acesso a tudo por um ano inteiro.',
    features: ['Todos os recursos do plano Mensal', 'Desconto de 2 meses', 'Acesso antecipado a novos recursos'],
    getLink: (userId: string) => `https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=138bb5652fe7421a9b5c37fb575fb6e7&external_reference=${userId}`,
    preapprovalPlanId: '138bb5652fe7421a9b5c37fb575fb6e7', // Mercado Pago Preapproval Plan ID
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
  const [isProcessingStripePayment, setIsProcessingStripePayment] = useState(false);

  // State for Mercado Pago checkout sheet
  const [isMercadoPagoCheckoutSheetOpen, setIsMercadoPagoCheckoutSheetOpen] = useState(false);
  const [mercadoPagoCheckoutUrl, setMercadoPagoCheckoutUrl] = useState<string | null>(null);

  // State for Stripe Payment Sheet
  const [isStripePaymentSheetOpen, setIsStripePaymentSheetOpen] = useState(false);
  const [stripeClientSecret, setStripeClientSecret] = useState<string | null>(null);

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
    const paymentStatus = searchParams.get('payment_status');
    if (paymentStatus === 'success') {
      toast({
        title: "Pagamento realizado com sucesso!",
        description: "Seu plano foi atualizado. Pode levar alguns instantes para refletir.",
      });
      // Clear search params
      router.replace('/dashboard/subscriptions', undefined);
      // Re-fetch subscription status
      setPageLoading(true); // Trigger re-fetch
    } else if (paymentStatus === 'failed') {
      toast({
        variant: "destructive",
        title: "Pagamento falhou",
        description: "Não foi possível processar seu pagamento. Por favor, tente novamente.",
      });
      router.replace('/dashboard/subscriptions', undefined);
    }
  }, [searchParams, toast, router]);


  const handleSelectPlan = async (planIdentifier: string, planName: string) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Você precisa estar autenticado para selecionar um plano.",
      });
      return;
    }

    if (planIdentifier === 'stripe-monthly') {
      setIsProcessingStripePayment(true);
      try {
        // Call Supabase Edge Function to create Payment Intent
        const { data, error } = await supabase.functions.invoke('create-stripe-payment-intent', {
          body: JSON.stringify({
            amount: 59.90, // Monthly plan amount
            currency: 'brl',
            userId: user.id,
          }),
        });

        if (error) throw error;
        
        const { clientSecret } = data as { clientSecret: string };
        setStripeClientSecret(clientSecret);
        setIsStripePaymentSheetOpen(true); // Open Stripe payment sheet
      } catch (error: any) {
        console.error("Error creating Stripe Payment Intent:", error);
        toast({
          variant: "destructive",
          title: "Erro ao iniciar pagamento",
          description: `Não foi possível iniciar o pagamento Stripe. ${error.message}`,
        });
      } finally {
        setIsProcessingStripePayment(false);
      }
    } else if (planIdentifier.startsWith('https://www.mercadopago.com.br')) {
      // For Mercado Pago, open in the sheet
      setMercadoPagoCheckoutUrl(planIdentifier);
      setIsMercadoPagoCheckoutSheetOpen(true);
    } else {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Link de pagamento não disponível para este plano.",
      });
    }
  };

  const handleStripePaymentSuccess = () => {
    toast({
      title: "Pagamento realizado com sucesso!",
      description: "Seu plano foi atualizado. Pode levar alguns instantes para refletir.",
    });
    setIsStripePaymentSheetOpen(false);
    setStripeClientSecret(null);
    setPageLoading(true); // Trigger re-fetch of subscription status
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
              'border-primary ring-2 ring-primary': currentPlan === plan.name,
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
            <CardFooter>
              {currentPlan === plan.name ? (
                 <Button className="w-full" disabled>
                    <Star className="mr-2 h-4 w-4" />
                    Plano Atual
                  </Button>
              ): (
                <Button
                  className="w-full"
                  disabled={!user || plan.name === 'Experimental' || isProcessingStripePayment}
                  onClick={() => user && handleSelectPlan(plan.getLink(user.id), plan.name)}
                >
                  {isProcessingStripePayment && plan.name === 'Mensal' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Selecionar Plano
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
       <div className="text-center text-sm text-muted-foreground">
            <p>Os pagamentos são processados de forma segura. Você pode cancelar ou alterar seu plano a qualquer momento.</p>
      </div>

      {/* Mercado Pago Checkout Sheet */}
      <MercadoPagoCheckoutSheet
        isOpen={isMercadoPagoCheckoutSheetOpen}
        onClose={() => setIsMercadoPagoCheckoutSheetOpen(false)}
        checkoutUrl={mercadoPagoCheckoutUrl}
      />

      {/* Stripe Payment Sheet */}
      <StripePaymentSheet
        isOpen={isStripePaymentSheetOpen}
        onClose={() => setIsStripePaymentSheetOpen(false)}
        clientSecret={stripeClientSecret}
        onPaymentSuccess={handleStripePaymentSuccess}
      />
    </div>
  );
}