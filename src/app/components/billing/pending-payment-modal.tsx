'use client';

import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import { listPayments } from '@/app/api/billing/billing';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useEffect, useMemo, useState } from 'react';
import { formatCurrency } from '@/app/utils/format';

export function PendingPaymentModal() {
    const { data: session } = useSession();
    const [isOpen, setIsOpen] = useState(false);

    // We can fetch page 0 to see recent payments.
    // Ideally we should have an endpoint "getMandatoryPendingPayment" but filtering list is okay for MVP.
    const { data: paymentsResponse } = useQuery({
        queryKey: ['company-payments', 0],
        queryFn: () => listPayments(session!, 0, 100), // Fetch more to be safe
        enabled: !!session?.user?.access_token,
        refetchInterval: 60000, // Check every minute? or just once on mount
    });

    const payments = useMemo(() => paymentsResponse?.items || [], [paymentsResponse?.items]);
    const mandatoryPayment = payments.find(p => p.is_mandatory && p.status === 'pending');

    useEffect(() => {
        if (mandatoryPayment) {
            setIsOpen(true);
        } else {
            setIsOpen(false);
        }
    }, [mandatoryPayment]);

    if (!mandatoryPayment) return null;

    const isOverdue = mandatoryPayment.expires_at ? new Date(mandatoryPayment.expires_at) < new Date() : false;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            // Prevent closing if overdue (force payment)
            // Or just nag? User said: "se for obrigatorio, sempre ao fazer login ... abre um modal"
            // Usually "mandatory" implies you can't ignore it easily.
            // Let's allow closing only if not overdue? Or allow closing but it pops up next time.
            // For now, allow closing but maybe add a "Remember me" or just persistent on every page load.
            if (!open && isOverdue) {
                // Block closing if overdue?
                // Let's allow closing for now to avoid locking user out if payment fails or something.
                // But typically "Mandatory" means block.
                // User request check: "se for obrigatorio, sempre ao fazer login ... abre um modal"
                setIsOpen(false);
            } else {
                setIsOpen(open);
            }
        }}>
            <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => {
                if (isOverdue) e.preventDefault();
            }} onEscapeKeyDown={(e) => {
                if (isOverdue) e.preventDefault();
            }}>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-red-600">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        Fatura Mensal Pendente
                    </DialogTitle>
                    <DialogDescription>
                        Existe uma fatura mensal pendente que precisa ser regularizada.
                        {isOverdue && <span className="block mt-2 font-bold text-red-600">Esta fatura está vencida! O acesso ao sistema pode ser bloqueado.</span>}
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Vencimento:</span>
                        <span>{mandatoryPayment.expires_at ? format(new Date(mandatoryPayment.expires_at), "dd/MM/yyyy", { locale: ptBR }) : "-"}</span>
                    </div>
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-sm font-medium">Valor Total:</span>
                        <span className="text-xl font-bold">{formatCurrency(parseFloat(mandatoryPayment.amount))}</span>
                    </div>

                    {mandatoryPayment.status === 'pending' && (
                        <div className="bg-yellow-50 p-3 rounded text-sm text-yellow-800 border border-yellow-200">
                            Status: Pagamento Pendente
                        </div>
                    )}
                </div>

                <DialogFooter className="sm:justify-between gap-2">
                    {!isOverdue && (
                        <Button variant="outline" onClick={() => setIsOpen(false)}>
                            Resolver depois
                        </Button>
                    )}
                    <Button className="w-full sm:w-auto bg-green-600 hover:bg-green-700" asChild>
                        <a href={mandatoryPayment.payment_url} target="_blank" rel="noopener noreferrer">
                            Pagar Agora
                        </a>
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
