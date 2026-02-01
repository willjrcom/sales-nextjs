"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function PendingContent() {
    const searchParams = useSearchParams();
    const paymentId = searchParams.get("payment_id");

    return (
        <div className="flex items-center justify-center p-8">
            <Card className="max-w-md w-full text-center">
                <CardHeader>
                    <div className="flex justify-center mb-4">
                        <Clock className="h-16 w-16 text-yellow-500" />
                    </div>
                    <CardTitle className="text-2xl">
                        Pagamento Pendente
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-600 mb-4">
                        Seu pagamento está sendo processado. Assim que for confirmado, seus créditos serão ativados automaticamente.
                    </p>
                    {paymentId && (
                        <p className="text-sm text-gray-400">
                            ID do Pagamento: {paymentId}
                        </p>
                    )}
                </CardContent>
                <CardFooter className="flex justify-center">
                    <Link href="/pages/billing">
                        <Button variant="outline" className="w-full">
                            Voltar para Faturamento
                        </Button>
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
}

export default function PaymentPendingPage() {
    return (
        <Suspense fallback={<div>Carregando...</div>}>
            <PendingContent />
        </Suspense>
    );
}
