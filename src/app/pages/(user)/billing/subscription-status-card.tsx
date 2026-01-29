"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GetSubscriptionStatus } from "@/app/api/company/subscription/status";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Crown, AlertTriangle } from "lucide-react";
import { FiscalSettingsDialog } from "./fiscal-settings-dialog";

const PLAN_LABELS = {
    free: { name: "Gratuito", color: "bg-gray-100 text-gray-700" },
    basic: { name: "Básico", color: "bg-blue-100 text-blue-700" },
    intermediate: { name: "Intermediário", color: "bg-purple-100 text-purple-700" },
    advanced: { name: "Avançado", color: "bg-amber-100 text-amber-700" },
};

export function SubscriptionStatusCard() {
    const { data: session } = useSession();

    const { data: status, isLoading } = useQuery({
        queryKey: ["subscription-status"],
        queryFn: () => GetSubscriptionStatus(session!),
        enabled: !!(session as any)?.user?.access_token,
    });

    if (isLoading) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <div className="animate-pulse space-y-3">
                        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!status) return null;

    const plan = PLAN_LABELS[status.current_plan] || PLAN_LABELS.free;
    const expiresAt = status.expires_at ? parseISO(status.expires_at) : null;
    const daysRemaining = status.days_remaining ?? null;
    const isExpiringSoon = daysRemaining !== null && daysRemaining <= 7 && daysRemaining > 0;
    const isExpired = daysRemaining !== null && daysRemaining <= 0;

    return (
        <Card className="border-2">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Crown className="w-6 h-6 text-primary" />
                        <div>
                            <CardTitle>Plano Atual</CardTitle>
                            <CardDescription>Status da sua assinatura</CardDescription>
                        </div>
                    </div>
                    <Badge className={plan.color}>{plan.name}</Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Expiration Info */}
                {expiresAt && (
                    <div className="flex items-center gap-2 pb-4 border-b">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <div className="flex-1">
                            <p className="text-sm font-medium">Válido até</p>
                            <p className="text-sm text-muted-foreground">
                                {format(expiresAt, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                            </p>
                        </div>
                        {daysRemaining !== null && (
                            <div className="text-right">
                                <p className={`text-lg font-bold ${isExpiringSoon || isExpired ? 'text-orange-600' : 'text-green-600'}`}>
                                    {daysRemaining} {daysRemaining === 1 ? 'dia' : 'dias'}
                                </p>
                                <p className="text-xs text-muted-foreground">restantes</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Warning if expiring soon */}
                {isExpiringSoon && (
                    <div className="flex items-start gap-2 bg-orange-50 border border-orange-200 text-orange-800 px-3 py-2 rounded-md text-sm">
                        <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="font-medium">Seu plano está próximo do vencimento</p>
                            <p className="text-xs mt-1">Renove agora para não perder acesso aos recursos.</p>
                        </div>
                    </div>
                )}

                {/* Upcoming Plan */}
                {status.upcoming_plan && status.upcoming_start_at && (
                    <div className="bg-blue-50 border border-blue-200 text-blue-700 px-3 py-2 rounded-md text-sm">
                        <p className="font-medium">Próximo plano agendado</p>
                        <p className="text-xs mt-1">
                            <span className="font-semibold">{PLAN_LABELS[status.upcoming_plan as keyof typeof PLAN_LABELS]?.name || status.upcoming_plan}</span>
                            {' '}a partir de{' '}
                            {format(parseISO(status.upcoming_start_at), "dd/MM/yyyy")}
                        </p>
                    </div>
                )}

                {/* Free Plan CTA */}
                {status.current_plan === 'free' && (
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 p-3 rounded-md text-sm">
                        <p className="font-medium text-purple-900">Faça upgrade para desbloquear emissão de notas fiscais!</p>
                        <p className="text-xs text-purple-700 mt-1">Escolha um plano abaixo para começar.</p>
                    </div>
                )}
                {status.current_plan !== 'free' && (
                    <div className="pt-4 border-t">
                        <FiscalSettingsDialog currentPlan={status.current_plan} />
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
