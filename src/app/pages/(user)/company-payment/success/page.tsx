"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SuccessContent() {
    const searchParams = useSearchParams();
    const status = searchParams.get("status");
    const paymentId = searchParams.get("payment_id");

    const isApproved = status === "approved";

    return (
        <div className="flex items-center justify-center p-8">
            <Card className="max-w-md w-full text-center">
                <CardHeader>
                    <div className="flex justify-center mb-4">
                        {isApproved ? (
                            <CheckCircle2 className="h-16 w-16 text-green-500" />
                        ) : (
                            <div className="h-16 w-16 bg-yellow-100 rounded-full flex items-center justify-center">
                                <span className="text-2xl">⚠️</span>
                            </div>
                        )}
                    </div>
                    <CardTitle className="text-2xl">
                        {isApproved ? "Pagamento Aprovado!" : "Pagamento em Processamento"}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-600 mb-4">
                        {isApproved
                            ? "Sua transação foi processada com sucesso. Seus créditos ou assinatura já devem estar ativos."
                            : "Estamos processando seu pagamento. Você receberá uma notificação assim que for confirmado."}
                    </p>
                    {paymentId && (
                        <p className="text-sm text-gray-400">
                            ID do Pagamento: {paymentId}
                        </p>
                    )}
                </CardContent>
                <CardFooter className="flex justify-center">
                    <Link href="/pages/billing">
                        <Button className="w-full">
                            Voltar para Faturamento
                        </Button>
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
}

export default function PaymentSuccessPage() {
    return (
        <Suspense fallback={<div>Carregando...</div>}>
            <SuccessContent />
        </Suspense>
    );
}
