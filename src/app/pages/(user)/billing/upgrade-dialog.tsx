"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { createUpgradeCheckout, simulateUpgrade, UpgradeSimulationResponse } from "@/app/api/billing/billing";
import { formatCurrency } from "@/app/utils/format";
import { Loader2, ArrowRight, CheckCircle2 } from "lucide-react";
import { notifyError } from "@/app/utils/notifications";

interface UpgradeDialogProps {
    isOpen: boolean;
    onClose: () => void;
    targetPlan: string;
    targetPlanName: string;
    currentPlanName?: string;
}

export function UpgradeDialog({ isOpen, onClose, targetPlan, targetPlanName, currentPlanName }: UpgradeDialogProps) {
    const { data: session } = useSession();
    const [loading, setLoading] = useState(false);
    const [simulation, setSimulation] = useState<UpgradeSimulationResponse | null>(null);
    const [checkingOut, setCheckingOut] = useState(false);

    useEffect(() => {
        if (isOpen && targetPlan) {
            fetchSimulation();
        } else {
            setSimulation(null);
        }
    }, [isOpen, targetPlan]);

    const fetchSimulation = async () => {
        if (!session) return;
        setLoading(true);
        try {
            const data = await simulateUpgrade(session, targetPlan);
            setSimulation(data);
        } catch (error: any) {
            notifyError(error?.message || "Erro ao simular upgrade");
            onClose();
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmUpgrade = async () => {
        if (!session) return;
        setCheckingOut(true);
        try {
            const response = await createUpgradeCheckout(session, targetPlan);
            if (response.checkout_url) {
                window.location.href = response.checkout_url;
            }
        } catch (error: any) {
            notifyError(error?.message || "Erro ao iniciar pagamento do upgrade");
            setCheckingOut(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Atualizar para o plano {targetPlanName}</DialogTitle>
                    <DialogDescription>
                        Revise os detalhes da mudança de plano.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-8 space-y-4">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="text-sm text-muted-foreground">Calculando custos proporcionais...</p>
                        </div>
                    ) : simulation ? (
                        <div className="space-y-6">
                            <div className="bg-primary/5 p-4 rounded-lg border border-primary/10">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium text-muted-foreground">Plano Atual</span>
                                    <span className="text-sm font-medium text-muted-foreground">Novo Plano</span>
                                </div>
                                <div className="flex justify-between items-center text-lg font-bold">
                                    <span>{currentPlanName}</span>
                                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                                    <span className="text-primary">{targetPlanName}</span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between text-base pt-2 border-t">
                                    <span className="font-semibold">Valor a pagar agora (Proporcional):</span>
                                    <span className="font-bold text-xl text-green-600">
                                        {formatCurrency(simulation.upgrade_amount)}
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground text-center pt-2">
                                    Na próxima renovação, você pagará o valor cheio do novo plano.
                                </p>
                            </div>
                        </div>
                    ) : null}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={checkingOut}>
                        Cancelar
                    </Button>
                    <Button onClick={handleConfirmUpgrade} disabled={loading || !simulation || checkingOut}>
                        {checkingOut ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processando...
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Confirmar e Pagar
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
