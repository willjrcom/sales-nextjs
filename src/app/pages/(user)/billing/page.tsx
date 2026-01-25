"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { formatCurrency } from "@/app/utils/format";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { billingService } from "@/app/api/billing/billing";
import GetCompany from "@/app/api/company/company";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

// Hardcoded Plan Prices (Synced with Backend ENVs)
const PLANS = {
    BASIC: { name: "Básico", price: 99.90, features: ["Gestão de Vendas", "Controle de Estoque", "Relatórios Básicos"] },
    INTERMEDIATE: { name: "Intermediário (+Fiscal)", price: 119.90, features: ["Tudo do Básico", "Emissão de NF-e/NFC-e", "Até 300 notas/mês"] },
    ENTERPRISE: { name: "Enterprise (+Ilimitado)", price: 129.90, features: ["Tudo do Intermediário", "Notas Ilimitadas", "Suporte Prioritário"] },
};

type Periodicity = "MONTHLY" | "SEMIANNUAL" | "ANNUAL";

export default function BillingPage() {
    const { data: session } = useSession();
    const [loading, setLoading] = useState(false);
    const [periodicity, setPeriodicity] = useState<Periodicity>("MONTHLY");

    const { data: company } = useQuery({
        queryKey: ['company'],
        queryFn: () => GetCompany(session!),
        enabled: !!session?.user.access_token,
    })

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
        // discountValue is per month or total? Total discount.
        const discountValue = total - final;

        return { total, final, discountValue };
    };

    const handleSubscribe = async (planKey: string) => {
        if (!session || !company?.id) return;
        setLoading(true);
        try {
            const response = await billingService.checkout(session, {
                company_id: company.id,
                plan: planKey,
                periodicity: periodicity,
            });

            if (response && response.data && response.data.init_point) {
                window.location.href = response.data.init_point;
            }
        } catch (error: any) {
            console.error(error);
            const msg = error?.message || "Erro ao iniciar checkout";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 space-y-8 max-w-6xl mx-auto">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Planos e Assinatura</h1>
                <p className="text-muted-foreground">Escolha o plano ideal para o seu negócio.</p>
            </div>

            {/* Periodicity Toggle */}
            <div className="flex justify-center">
                <Tabs defaultValue="MONTHLY" onValueChange={(v) => setPeriodicity(v as Periodicity)} className="w-[400px]">
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

                    return (
                        <div key={key} className={`flex flex-col p-6 border rounded-xl shadow-sm hover:shadow-md transition-all ${key === "INTERMEDIATE" ? "border-primary/50 bg-primary/5" : "bg-card"}`}>
                            <div className="mb-4">
                                <h3 className="font-bold text-xl">{plan.name}</h3>
                                {key === "INTERMEDIATE" && <Badge className="mt-2" variant="secondary">Mais Popular</Badge>}
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
                                variant={key === "INTERMEDIATE" ? "default" : "outline"}
                                disabled={loading}
                                onClick={() => handleSubscribe(key)}
                            >
                                {loading ? "Processando..." : "Assinar Agora"}
                            </Button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
