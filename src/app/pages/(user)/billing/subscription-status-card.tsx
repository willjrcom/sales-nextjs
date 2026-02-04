"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { GetSubscriptionStatus } from "@/app/api/company/subscription/status";
import { cancelSubscription } from "@/app/api/billing/billing";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Crown, AlertTriangle, XCircle } from "lucide-react";
import { FiscalSettingsDialog } from "./fiscal-settings-dialog";
import { PlanType } from "@/app/entities/company/subscription";
import { notifyError, notifySuccess } from "@/app/utils/notifications";
import { useState } from "react";

const PLAN_LABELS = {
    [PlanType.FREE]: { name: "Gratuito", color: "bg-gray-100 text-gray-700" },
    [PlanType.BASIC]: { name: "Básico", color: "bg-blue-100 text-blue-700" },
    [PlanType.INTERMEDIATE]: { name: "Intermediário", color: "bg-purple-100 text-purple-700" },
    [PlanType.ADVANCED]: { name: "Avançado", color: "bg-amber-100 text-amber-700" },
};

export function SubscriptionStatusCard() {
    const { data: session } = useSession();
    const queryClient = useQueryClient();
    const [cancelling, setCancelling] = useState(false);
    const [showCancelDialog, setShowCancelDialog] = useState(false);

    const { data: status, isLoading } = useQuery({
        queryKey: ["subscription-status"],
        queryFn: () => GetSubscriptionStatus(session!),
        enabled: !!(session as any)?.user?.access_token,
    });

    const handleCancelSubscription = async () => {
        if (!session) return;

        setShowCancelDialog(false); // Close dialog
        setCancelling(true);
        try {
            await cancelSubscription(session);
            notifySuccess("Assinatura cancelada com sucesso! Você terá acesso até o fim do período atual.");
            queryClient.invalidateQueries({ queryKey: ["subscription-status"] });
            queryClient.invalidateQueries({ queryKey: ["company"] });
        } catch (error: any) {
            notifyError(error?.message || "Erro ao cancelar assinatura");
        } finally {
            setCancelling(false);
        }
    };

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

    const normalizedPlan = status.current_plan?.toLowerCase() || 'free';
    const plan = PLAN_LABELS[normalizedPlan as keyof typeof PLAN_LABELS] || PLAN_LABELS.free;
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
                    <div className="flex flex-col items-end gap-1.5">
                        <Badge className={`${plan.color} px-3 py-1 text-sm`}>{plan.name}</Badge>
                        {status.frequency && status.frequency !== "MONTHLY" && (
                            <Badge variant="outline" className="text-xs font-medium gap-1.5 py-0.5 px-2 text-muted-foreground border-muted-foreground/30">
                                <Calendar className="w-3 h-3" />
                                {status.frequency === "SEMIANNUAL" ? "Semestral" : "Anual"}
                            </Badge>
                        )}
                        {status.frequency === "MONTHLY" && (
                            <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground/70 bg-muted/50 px-2 py-0.5 rounded-sm">
                                Mensal
                            </span>
                        )}
                    </div>
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
                            <span className="font-semibold">{PLAN_LABELS[status.upcoming_plan?.toLowerCase() as keyof typeof PLAN_LABELS]?.name || status.upcoming_plan}</span>
                            {' '}a partir de{' '}
                            {format(parseISO(status.upcoming_start_at), "dd/MM/yyyy")}
                        </p>
                    </div>
                )}

                {/* Free Plan CTA */}
                {(normalizedPlan === 'free' || normalizedPlan === 'basic') && (
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 p-3 rounded-md text-sm">
                        <p className="font-medium text-purple-900">Faça upgrade para desbloquear emissão de notas fiscais!</p>
                        <p className="text-xs text-purple-700 mt-1">Escolha um plano abaixo para começar.</p>
                    </div>
                )}

                <div className="flex justify-end">
                    <div className="flex flex-col gap-2">
                        {/* Fiscal Settings & Cancel Button for Paid Plans */}
                        {(normalizedPlan === 'intermediate' || normalizedPlan === 'advanced') && (
                            <FiscalSettingsDialog currentPlan={normalizedPlan} />
                        )}

                        {/* Cancel Button: Show for ANY active paid plan (not Free) */}
                        {normalizedPlan !== 'free' && status.can_cancel_renewal && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-700"
                                onClick={() => setShowCancelDialog(true)}
                                disabled={cancelling}
                            >
                                <XCircle className="w-3 h-3 mr-1.5" />
                                <span className="text-xs">{cancelling ? "Cancelando..." : "Cancelar renovação"}</span>
                            </Button>
                        )}
                        {/* show message "A recorrência do seu plano foi cancelada!"*/}
                        {status.current_plan !== 'free' && !status.can_cancel_renewal && (
                            <Badge
                                variant="destructive"
                                className="text-red-600 hover:text-red-700 hover:bg-red-700"
                            >
                                <span className="text-xs text-white">A recorrência do seu plano foi cancelada!</span>
                            </Badge>
                        )}
                    </div>
                </div>
            </CardContent>

            {/* Cancel Confirmation Dialog */}
            <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Cancelar renovação automática?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Você continuará com acesso ao plano atual até o fim do período já pago.
                            A cobrança automática será cancelada e você não será cobrado novamente.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Voltar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleCancelSubscription}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Confirmar cancelamento
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Card>
    );
}
