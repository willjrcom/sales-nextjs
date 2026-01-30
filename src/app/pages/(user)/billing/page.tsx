"use client";

import { useMemo, useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { formatCurrency } from "@/app/utils/format";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { createCheckout, listPayments, getMonthlyCosts, cancelPayment, triggerMonthlyBilling } from "@/app/api/billing/billing";
import GetCompany from "@/app/api/company/company";
import CrudTable from "@/app/components/crud/table";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Refresh, { FormatRefreshTime } from "@/app/components/crud/refresh";
import { RegisterCostDialog } from "@/app/pages/(user)/billing/register-cost-dialog";
import { SubscriptionStatusCard } from "@/app/pages/(user)/billing/subscription-status-card";
import { notifyError, notifyLoading, notifySuccess } from "@/app/utils/notifications";
import { paymentColumns } from "@/app/entities/company/company-payment-columns";
import { costColumns } from "@/app/entities/company/company-usage-cost-columns";

// Hardcoded Plan Prices
const PLANS = {
    BASIC: { name: "Básico", price: parseFloat(process.env.NEXT_PUBLIC_PRICE_BASIC || "99.90"), features: ["Gestão de Vendas", "Controle de Estoque", "Relatórios Básicos"] },
    INTERMEDIATE: { name: "Intermediário (+Fiscal)", price: parseFloat(process.env.NEXT_PUBLIC_PRICE_INTERMEDIATE || "119.90"), features: ["Tudo do Básico", "Emissão de NF-e/NFC-e", "Até 300 notas/mês"] },
    ADVANCED: { name: "Avançado (+Ilimitado)", price: parseFloat(process.env.NEXT_PUBLIC_PRICE_ADVANCED || "129.90"), features: ["Tudo do Intermediário", "Notas Ilimitadas", "Suporte Prioritário"] },
};

type Periodicity = "MONTHLY" | "SEMIANNUAL" | "ANNUAL";

export default function BillingPage() {
    const { data: session } = useSession();
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const currentTab = searchParams.get("tab") || "plans";

    const handleTabChange = (value: string) => {
        const params = new URLSearchParams(searchParams?.toString());
        params.set("tab", value);
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    };
    const [loading, setLoading] = useState(false);
    const [periodicity, setPeriodicity] = useState<Periodicity>("MONTHLY");

    const { data: company } = useQuery({
        queryKey: ['company'],
        queryFn: () => GetCompany(session!),
        enabled: !!(session as any)?.user?.access_token,
    });

    // Handle post-payment feedback
    useEffect(() => {
        const status = searchParams.get("payment");

        if (status === "success") {
            notifySuccess("Pagamento realizado com sucesso! Aguardando confirmação do Mercado Pago.");
            // Clean URL
            const params = new URLSearchParams(searchParams?.toString());
            params.delete("payment");
            router.replace(`${pathname}?${params.toString()}`, { scroll: false });
        } else if (status === "failed") {
            notifyError("Pagamento não foi concluído. Tente novamente.");
            const params = new URLSearchParams(searchParams?.toString());
            params.delete("payment");
            router.replace(`${pathname}?${params.toString()}`, { scroll: false });
        }
    }, [searchParams, router, pathname]);

    const currentDate = new Date();

    // Payments State
    const [paymentsPage, setPaymentsPage] = useState(0);
    const [paymentsMonth, setPaymentsMonth] = useState(currentDate.getMonth() + 1);
    const [paymentsYear, setPaymentsYear] = useState(currentDate.getFullYear());

    const { data: paymentsResponse, refetch: refetchPayments, isRefetching: isRefetchingPayments, dataUpdatedAt: paymentsUpdatedAt } = useQuery({
        queryKey: ['company-payments', paymentsPage, paymentsMonth, paymentsYear],
        queryFn: () => listPayments(session!, paymentsPage, 10, paymentsMonth, paymentsYear),
        enabled: !!(session as any)?.user?.access_token,
    });

    // Costs State
    const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
    const [costsPage, setCostsPage] = useState(0);

    const { data: costsResponse, refetch: refetchCosts, isRefetching: isRefetchingCosts, dataUpdatedAt: costsUpdatedAt } = useQuery({
        queryKey: ['company-costs', selectedMonth, selectedYear, costsPage],
        queryFn: () => getMonthlyCosts(session!, selectedMonth, selectedYear, costsPage),
        enabled: !!(session as any)?.user?.access_token,
    });

    const payments = useMemo(() => paymentsResponse?.items || [], [paymentsResponse?.items]);
    const costs = useMemo(() => costsResponse?.items || [], [costsResponse?.items]);

    const calculateTotal = (basePrice: number) => {
        let months = 1;
        let discount = 0;

        if (periodicity === "SEMIANNUAL") {
            months = 6;
            discount = 0.05;
        } else if (periodicity === "ANNUAL") {
            months = 12;
            discount = 0.10;
        }

        const total = basePrice * months;
        const final = total * (1 - discount);
        const discountValue = total - final;

        return { total, final, discountValue };
    };

    const handleSubscribe = async (planKey: string) => {
        if (!session || !company?.id) return;
        setLoading(true);
        try {
            const response = await createCheckout(session, {
                company_id: company.id,
                plan: planKey,
                periodicity: periodicity,
            });

            if (response.checkout_url) {
                window.location.href = response.checkout_url;
            }
        } catch (error: any) {
            notifyError(error?.message || "Erro ao iniciar checkout");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (paymentId: string) => {
        if (!session) return;


        setLoading(true);
        try {
            await cancelPayment(session, paymentId);
            notifySuccess("Pagamento cancelado com sucesso!");
            refetchPayments();
            refetchCosts();
        } catch (error: any) {
            notifyError(error?.message || "Erro ao cancelar pagamento");
        } finally {
            setLoading(false);
        }
    };

    const handleTriggerBatch = async () => {
        if (!session) return;
        setLoading(true);
        try {
            await triggerMonthlyBilling(session);
            notifyLoading("Processamento mensal iniciado com sucesso!");
            refetchPayments();
            refetchCosts();
        } catch (error: any) {
            notifyError(error?.message || "Erro ao rodar mensalidade");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 space-y-8 max-w-6xl mx-auto">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Cobrança e Planos</h1>
                <p className="text-muted-foreground">Gerencie sua assinatura e visualize seu histórico financeiro.</p>
            </div>

            <Tabs value={currentTab} onValueChange={handleTabChange} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="plans">Planos</TabsTrigger>
                    <TabsTrigger value="history">Extrato Financeiro</TabsTrigger>
                    <TabsTrigger value="costs">Custos de Uso</TabsTrigger>
                </TabsList>

                <TabsContent value="plans" className="space-y-8">
                    <SubscriptionStatusCard />

                    {/* Periodicity Toggle */}
                    <div className="flex justify-center mt-6">
                        <Tabs value={periodicity} onValueChange={(v) => setPeriodicity(v as Periodicity)} className="w-[400px]">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="MONTHLY">Mensal</TabsTrigger>
                                <TabsTrigger value="SEMIANNUAL">Semestral (-5%)</TabsTrigger>
                                <TabsTrigger value="ANNUAL">Anual (-10%)</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>

                    {/* Plan Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {Object.entries(PLANS).map(([key, plan]) => {
                            const { final, discountValue } = calculateTotal(plan.price);
                            const isCurrentPlan = company?.plan_type?.toLowerCase() === key.toLowerCase();

                            return (
                                <div key={key} className={`flex flex-col p-6 border rounded-xl shadow-sm hover:shadow-md transition-all ${isCurrentPlan ? "border-green-500 bg-green-50/50" :
                                        key === "INTERMEDIATE" ? "border-primary/50 bg-primary/5" : "bg-card"
                                    }`}>
                                    <div className="mb-4">
                                        <h3 className="font-bold text-xl">{plan.name}</h3>
                                        <div className="flex gap-2 mt-2">
                                            {isCurrentPlan && <Badge variant="default" className="bg-green-600">Plano Atual</Badge>}
                                            {key === "INTERMEDIATE" && !isCurrentPlan && <Badge variant="secondary">Mais Popular</Badge>}
                                        </div>
                                    </div>

                                    <div className="mb-6">
                                        {periodicity === "MONTHLY" ? (
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-3xl font-bold">{formatCurrency(final)}</span>
                                                <span className="text-sm text-muted-foreground">/mês</span>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-3xl font-bold">{formatCurrency(final / (periodicity === "SEMIANNUAL" ? 6 : 12))}</span>
                                                    <span className="text-sm text-muted-foreground">/mês</span>
                                                </div>
                                                <div className="text-xs text-muted-foreground mt-1">
                                                    Total de {formatCurrency(final)} por {periodicity === "SEMIANNUAL" ? "semestre" : "ano"}
                                                </div>
                                                <div className="text-xs text-green-600 font-medium mt-1">
                                                    Economia de {formatCurrency(discountValue)}
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    <ul className="space-y-3 mb-6 flex-1">
                                        {plan.features.map((feature, i) => (
                                            <li key={i} className="flex items-center gap-2 text-sm">
                                                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>

                                    <Button
                                        className="w-full"
                                        variant={key === "INTERMEDIATE" && !isCurrentPlan ? "default" : "outline"}
                                        disabled={loading || isCurrentPlan}
                                        onClick={() => handleSubscribe(key)}
                                    >
                                        {isCurrentPlan ? "Plano Ativo" : loading ? "Processando..." : "Assinar Agora"}
                                    </Button>
                                </div>
                            );
                        })}
                    </div>
                </TabsContent>

                <TabsContent value="history">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle>Histórico de Pagamentos</CardTitle>
                                    <CardDescription>Visualize todos os pagamentos realizados.</CardDescription>
                                </div>
                                <div className="flex gap-4 items-center">
                                    <select
                                        className="bg-background border rounded px-3 py-2 text-sm"
                                        value={paymentsMonth}
                                        onChange={(e) => setPaymentsMonth(Number(e.target.value))}
                                    >
                                        {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                                            <option key={m} value={m}>{format(new Date(2024, m - 1, 1), "MMMM", { locale: ptBR })}</option>
                                        ))}
                                    </select>
                                    <select
                                        className="bg-background border rounded px-3 py-2 text-sm"
                                        value={paymentsYear}
                                        onChange={(e) => setPaymentsYear(Number(e.target.value))}
                                    >
                                        {[2024, 2025, 2026].map(y => (
                                            <option key={y} value={y}>{y}</option>
                                        ))}
                                    </select>
                                    <Refresh
                                        onRefresh={refetchPayments}
                                        isPending={isRefetchingPayments}
                                        lastUpdate={paymentsUpdatedAt ? FormatRefreshTime(new Date(paymentsUpdatedAt)) : undefined}
                                    />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <CrudTable
                                columns={paymentColumns(handleCancel)}
                                data={payments}
                                onPageChange={(page) => setPaymentsPage(page)}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="costs">
                    <div className="flex gap-4 mb-4 items-center justify-between">
                        <div className="flex gap-4">
                            <select
                                className="bg-background border rounded px-3 py-2"
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                            >
                                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                                    <option key={m} value={m}>{format(new Date(2024, m - 1, 1), "MMMM", { locale: ptBR })}</option>
                                ))}
                            </select>
                            <select
                                className="bg-background border rounded px-3 py-2"
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(Number(e.target.value))}
                            >
                                {[2024, 2025, 2026].map(y => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-center">
                        </div>
                        <Button
                            variant="secondary"
                            onClick={handleTriggerBatch}
                            disabled={loading}
                        >
                            {loading ? "..." : "Rodar Mensalidade"}
                        </Button>

                        <RegisterCostDialog onSuccess={refetchCosts} />
                        <Refresh
                            onRefresh={refetchCosts}
                            isPending={isRefetchingCosts}
                            lastUpdate={costsUpdatedAt ? FormatRefreshTime(new Date(costsUpdatedAt)) : undefined}
                            optionalText="Custos"
                        />
                    </div>


                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Total do Mês</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{formatCurrency(parseFloat(costsResponse?.total_amount || "0"))}</div>
                                <p className="text-xs text-muted-foreground mt-1">Pago: {formatCurrency(parseFloat(costsResponse?.total_paid || "0"))}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Notas Emitidas</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{costsResponse?.nfce_count || 0}</div>
                                <p className="text-xs text-muted-foreground mt-1">Custo: {formatCurrency(parseFloat(costsResponse?.nfce_costs || "0"))}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Outros</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{formatCurrency(parseFloat(costsResponse?.other_fee || "0"))}</div>
                            </CardContent>
                        </Card>
                    </div>


                    <div className="mt-6">
                        <CrudTable
                            columns={costColumns()}
                            data={costs}
                            onPageChange={(page) => setCostsPage(page + 1)} // CrudTable uses 0-based index, API uses 1-based (from my specific impl)
                        />
                    </div>
                </TabsContent >
            </Tabs >
        </div >
    );
}
