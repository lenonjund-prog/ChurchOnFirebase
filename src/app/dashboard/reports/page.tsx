"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useToast } from "@/hooks/use-toast";
import { Loader2, FileBarChart } from "lucide-react";
import { Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, BarChart } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

import type { TitheOffering } from "@/components/tithe-offering-form";
import type { Expense } from "@/components/expense-form";
import type { Member } from "@/components/member-form";
import type { Visitor } from "@/components/visitor-form";
import { useSession } from "@/components/supabase-session-provider";

// Extend jsPDF with autoTable and previousAutoTable
interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDF;
  previousAutoTable: { finalY: number } | undefined; // Add this property
}

type MonthlyData = {
  month: string;
  entradas: number;
  saidas: number;
};

type MembersData = {
  name: string;
  total: number;
}

export default function ReportsPage() {
  const { user, loading: sessionLoading } = useSession();
  const { toast } = useToast();
  const [reportType, setReportType] = useState("finance");
  const [period, setPeriod] = useState("monthly");
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [loading, setLoading] = useState(false);
  const [loadingCharts, setLoadingCharts] = useState(true);
  const [profile, setProfile] = useState<{firstName?: string, lastName?:string}>({});

  const [financialChartData, setFinancialChartData] = useState<MonthlyData[]>([]);
  const [membersChartData, setMembersChartData] = useState<MembersData[]>([]);

  useEffect(() => {
    if(user) {
        // Fetch user's first and last name from profiles table
        supabase.from('profiles').select('first_name, last_name').eq('id', user.id).single()
            .then(({ data, error }) => {
                if (error) {
                    console.error("Error fetching profile for reports:", error);
                    setProfile({ firstName: user.email?.split('@')[0] || '', lastName: '' });
                } else if (data) {
                    setProfile({ firstName: data.first_name || '', lastName: data.last_name || '' });
                }
            });
    }
  }, [user]);

   useEffect(() => {
    if (!user) {
        setLoadingCharts(false);
        return;
    }

    const fetchChartData = async () => {
        setLoadingCharts(true);
        try {
            // Financial Data
            const startDate = new Date(year, 0, 1).toISOString();
            const endDate = new Date(year, 11, 31, 23, 59, 59).toISOString();

            const { data: tithesOfferingsData, error: tithesOfferingsError } = await supabase
                .from('tithes_offerings')
                .select('type, amount, date')
                .eq('user_id', user.id)
                .gte('date', startDate)
                .lte('date', endDate);

            if (tithesOfferingsError) throw tithesOfferingsError;

            const { data: expensesData, error: expensesError } = await supabase
                .from('expenses')
                .select('amount, date')
                .eq('user_id', user.id)
                .gte('date', startDate)
                .lte('date', endDate);

            if (expensesError) throw expensesError;
            
            const monthlyData: MonthlyData[] = Array.from({length: 12}, (_, i) => ({
                month: new Date(0, i).toLocaleString('pt-BR', { month: 'short' }).replace('.', ''),
                entradas: 0,
                saidas: 0,
            }));

            tithesOfferingsData.forEach(item => {
                const itemMonth = new Date(item.date).getMonth();
                monthlyData[itemMonth].entradas += item.amount;
            });
            
            expensesData.forEach(item => {
                const itemMonth = new Date(item.date).getMonth();
                monthlyData[itemMonth].saidas += item.amount;
            });

            setFinancialChartData(monthlyData);

            // Members Data
            const { data: membersData, error: membersError } = await supabase
                .from('members')
                .select('status')
                .eq('user.id', user.id);

            if (membersError) throw membersError;

            const activeMembers = membersData.filter(m => m.status === 'Ativo').length;
            const inactiveMembers = membersData.length - activeMembers;
            setMembersChartData([
                { name: 'Ativos', total: activeMembers },
                { name: 'Inativos', total: inactiveMembers },
            ]);

        } catch (error: any) {
            console.error("Error fetching chart data:", error);
            toast({ variant: 'destructive', title: 'Erro ao carregar gráficos', description: error.message });
        } finally {
            setLoadingCharts(false);
        }
    };
    
    fetchChartData();
  }, [user, year, toast]);


  const monthlyBalanceData = useMemo(() => {
    const selectedMonthData = financialChartData[month -1];
    if (!selectedMonthData) return [];

    const balance = selectedMonthData.entradas - selectedMonthData.saidas;
    
    return [
      { name: 'Entradas', valor: selectedMonthData.entradas, fill: 'var(--color-entradas)' },
      { name: 'Saídas', valor: selectedMonthData.saidas, fill: 'var(--color-saidas)' },
      { name: 'Saldo', valor: balance, fill: 'var(--color-saldo)' },
    ];
  }, [financialChartData, month]);


  const generatePDF = async () => {
    if (!user) {
      toast({ variant: "destructive", title: "Erro", description: "Você não está autenticado." });
      return;
    }
    setLoading(true);

    const doc = new jsPDF() as jsPDFWithAutoTable;

    doc.setFontSize(18);
    doc.text(`Relatório de ${reportType === 'finance' ? 'Finanças' : reportType === 'members' ? 'Membros' : 'Visitantes'}`, 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);

    const generatedAt = `Gerado em: ${new Date().toLocaleDateString('pt-BR')} por ${profile.firstName} ${profile.lastName || ''}`;
    doc.text(generatedAt, 14, 30);


    try {
      if (reportType === 'finance') {
        await generateFinancialReport(doc);
      } else if (reportType === 'members') {
        await generateMembersReport(doc);
      } else if (reportType === 'visitors') {
        await generateVisitorsReport(doc);
      }

      doc.save(`relatorio_${reportType}_${new Date().toISOString().split('T')[0]}.pdf`);
      toast({ title: "Sucesso!", description: "Relatório gerado e download iniciado." });

    } catch(e: any) {
        console.error(e);
        toast({ variant: "destructive", title: "Erro", description: `Não foi possível gerar o relatório. ${e.message}` });
    } finally {
        setLoading(false);
    }
  };

  const getFinancialData = async () => {
    const startDate = period === 'annual' ? new Date(year, 0, 1).toISOString() : new Date(year, month - 1, 1).toISOString();
    const endDate = period === 'annual' ? new Date(year, 11, 31, 23, 59, 59).toISOString() : new Date(year, month, 0, 23, 59, 59).toISOString();

    const { data: tithesOfferingsData, error: tithesOfferingsError } = await supabase
        .from('tithes_offerings')
        .select('*')
        .eq('user_id', user!.id)
        .gte('date', startDate)
        .lte('date', endDate);

    if (tithesOfferingsError) throw tithesOfferingsError;

    const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user!.id)
        .gte('date', startDate)
        .lte('date', endDate);

    if (expensesError) throw expensesError;
    
    const entries = tithesOfferingsData.map(doc => ({
        id: doc.id,
        memberId: doc.member_id,
        type: doc.type,
        amount: doc.amount,
        date: doc.date,
        method: doc.method,
        observations: doc.observations,
        sourceId: doc.source_id,
    } as TitheOffering));
    const exits = expensesData.map(doc => ({
        id: doc.id,
        description: doc.description,
        amount: doc.amount,
        date: doc.date,
        category: doc.category,
        paymentMethod: doc.payment_method,
        observations: doc.observations,
    } as Expense));

    return { entries, exits, startDate, endDate };
  }

  const generateFinancialReport = async (doc: jsPDFWithAutoTable) => {
    const { entries, exits, startDate, endDate } = await getFinancialData();
    const periodStr = period === 'annual' ? `Ano de ${year}` : `Mês ${month}/${year}`;
    doc.text(`Período: ${periodStr}`, 14, 36);

    let totalEntries = 0;
    const entryData = entries.map(e => {
        totalEntries += e.amount;
        return [
            e.type,
            new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(e.amount),
            new Date(e.date).toLocaleDateString('pt-BR', {timeZone: 'UTC'}),
        ]
    });

    let totalExits = 0;
    const exitData = exits.map(e => {
        totalExits += e.amount;
        return [
            e.description,
            new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(e.amount),
            new Date(e.date).toLocaleDateString('pt-BR', {timeZone: 'UTC'}),
            e.category
        ]
    });
    
    doc.autoTable({
        head: [['Tipo', 'Valor', 'Data']],
        body: entryData,
        startY: 44,
        headStyles: { fillColor: [22, 163, 74] },
        didDrawPage: (data: any) => { // Using 'any' for HookData as it's globally augmented
            doc.text('Entradas (Dízimos e Ofertas)', data.settings.margin.left ?? 14, 42);
        }
    });

     doc.autoTable({
        head: [['Descrição', 'Valor', 'Data', 'Categoria']],
        body: exitData,
        headStyles: { fillColor: [220, 38, 38] },
        didDrawPage: (data: any) => { // Using 'any' for HookData as it's globally augmented
            doc.text('Saídas (Despesas)', data.settings.margin.left ?? 14, (data.table.finalY ?? 0) + 10);
        },
        startY: (doc.previousAutoTable?.finalY ?? 0) + 12,
    });
    
    const finalY = doc.previousAutoTable?.finalY ?? 0;
    doc.setFontSize(14);
    doc.text('Resumo Financeiro', 14, finalY + 15);
    doc.setFontSize(12);

    const summary = [
        `Total de Entradas: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalEntries)}`,
        `Total de Saídas: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalExits)}`,
        `Saldo Final: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalEntries - totalExits)}`
    ];

    doc.text(summary, 14, finalY + 22);
  }

  const generateMembersReport = async (doc: jsPDFWithAutoTable) => {
    const { data: membersData, error: membersError } = await supabase
        .from('members')
        .select('*')
        .eq('user_id', user!.id);

    if (membersError) throw membersError;
    const members = membersData.map(doc => ({
        id: doc.id,
        fullName: doc.full_name,
        phone: doc.phone,
        email: doc.email,
        address: doc.address,
        isBaptized: doc.is_baptized,
        status: doc.status,
        role: doc.role,
        joined: doc.joined,
    } as Member));

    const bodyData = members.map(m => [
        m.fullName,
        m.email,
        m.phone,
        m.status,
        new Date(m.joined).toLocaleDateString('pt-BR', { timeZone: 'UTC' })
    ]);

    doc.autoTable({
        head: [['Nome Completo', 'Email', 'Telefone', 'Status', 'Membro Desde']],
        body: bodyData,
        startY: 40,
    });
  }

  const generateVisitorsReport = async (doc: jsPDFWithAutoTable) => {
    const { data: visitorsData, error: visitorsError } = await supabase
        .from('visitors')
        .select('*')
        .eq('user_id', user!.id);

    if (visitorsError) throw visitorsError;
    const visitors = visitorsData.map(doc => ({
        id: doc.id,
        fullName: doc.full_name,
        phone: doc.phone,
        email: doc.email,
        address: doc.address,
        isChristian: doc.is_christian,
        denomination: doc.denomination,
        createdAt: doc.created_at,
        sourceId: doc.source_id,
    } as Visitor));
     
    const bodyData = visitors.map(v => [
        v.fullName,
        v.email || 'N/A',
        v.phone || 'N/A',
        new Date(v.createdAt).toLocaleDateString('pt-BR', { timeZone: 'UTC' }),
        v.isChristian === 'sim' ? 'Sim' : 'Não'
    ]);

    doc.autoTable({
        head: [['Nome Completo', 'Email', 'Telefone', 'Data da Visita', 'É Cristão?']],
        body: bodyData,
        startY: 40,
    });
  }

  const chartConfig = {
      entradas: { label: "Entradas", color: "hsl(var(--chart-2))" },
      saidas: { label: "Saídas", color: "hsl(var(--chart-5))" },
      saldo: { label: "Saldo", color: "hsl(var(--primary))" },
      ativos: { label: "Ativos", color: "hsl(var(--chart-2))" },
      inativos: { label: "Inativos", color: "hsl(var(--chart-5))" }
  };

  if (sessionLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className='ml-2'>Carregando...</p>
      </div>
    );
  }

  // Adicionado o return para o estado de carregamento dos gráficos
  if (loadingCharts) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className='ml-2'>Carregando gráficos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileBarChart className="h-6 w-6" />
            Geração de Relatórios
          </CardTitle>
          <CardDescription>
            Selecione o tipo e o período do relatório que deseja gerar em PDF.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="report-type">Tipo de Relatório</Label>
                <Select value={reportType} onValueChange={setReportType}>
                    <SelectTrigger id="report-type" className="w-full md:w-1/3">
                        <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="finance">Financeiro</SelectItem>
                        <SelectItem value="members">Membros</SelectItem>
                        <SelectItem value="visitors">Visitantes</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            {reportType === 'finance' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                         <Label htmlFor="period">Período</Label>
                        <Select value={period} onValueChange={setPeriod}>
                            <SelectTrigger id="period">
                                <SelectValue placeholder="Selecione o período" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="monthly">Mensal</SelectItem>
                                <SelectItem value="annual">Anual</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                         <Label htmlFor="year">Ano</Label>
                         <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
                            <SelectTrigger id="year">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {[new Date().getFullYear() -1, new Date().getFullYear(), new Date().getFullYear() + 1].map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                     {period === 'monthly' && (
                         <div className="space-y-2">
                             <Label htmlFor="month">Mês</Label>
                            <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
                                <SelectTrigger id="month">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Array.from({length: 12}, (_, i) => i + 1).map(m => (
                                        <SelectItem key={m} value={String(m)}>{new Date(0, m-1).toLocaleString('pt-BR', { month: 'long' })}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                     )}
                </div>
            )}
             <Button onClick={generatePDF} disabled={loading} className="w-full sm:w-auto">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Gerar PDF
            </Button>
        </CardContent>
      </Card>

        {/* Removida a verificação loadingCharts aqui, pois já é tratada acima */}
          <div className="grid gap-6 md:grid-cols-2">
              <Card>
                  <CardHeader>
                      <CardTitle>Resumo Financeiro Anual ({year})</CardTitle>
                      <CardDescription>Entradas vs. Saídas por mês</CardDescription>
                  </CardHeader>
                  <CardContent>
                      <ChartContainer config={chartConfig} className="h-64 w-full">
                          <BarChart accessibilityLayer data={financialChartData}>
                              <CartesianGrid vertical={false} />
                              <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
                              <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `R$${value/1000}k`}/>
                              <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                              <Legend />
                              <Bar dataKey="entradas" fill="var(--color-entradas)" radius={4} />
                              <Bar dataKey="saidas" fill="var(--color-saidas)" radius={4} />
                          </BarChart>
                      </ChartContainer>
                  </CardContent>
              </Card>
              
               <Card>
                  <CardHeader>
                      <CardTitle>Total de Membros</CardTitle>
                      <CardDescription>Membros ativos e inativos</CardDescription>
                  </CardHeader>
                  <CardContent>
                      <ChartContainer config={chartConfig} className="h-64 w-full">
                          <BarChart accessibilityLayer data={membersChartData} layout="vertical">
                             <XAxis type="number" hide />
                             <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} />
                             <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                             <Bar dataKey="total" layout="vertical" radius={4} />
                          </BarChart>
                      </ChartContainer>
                  </CardContent>
              </Card>

              <Card className="md:col-span-2">
                  <CardHeader>
                      <CardTitle>Balanço de {new Date(0, month-1).toLocaleString('pt-BR', { month: 'long' })}/{year}</CardTitle>
                      <CardDescription>Entradas, saídas e saldo do mês</CardDescription>
                  </CardHeader>
                  <CardContent>
                       <ChartContainer config={chartConfig} className="h-64 w-full">
                          <BarChart accessibilityLayer data={monthlyBalanceData}>
                              <CartesianGrid vertical={false} />
                              <XAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false} />
                              <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `R$${value/1000}k`}/>
                              <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                              <Bar dataKey="valor" radius={4} />
                          </BarChart>
                      </ChartContainer>
                  </CardContent>
              </Card>

          </div>
    </div>
  );
}