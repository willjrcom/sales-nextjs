"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { XCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function FailureContent() {
    const searchParams = useSearchParams();
    const paymentId = searchParams.get("payment_id");

    return (
        <div className="flex items-center justify-center p-8">
            <Card className="max-w-md w-full text-center">
                <CardHeader>
                    <div className="flex justify-center mb-4">
                        <XCircle className="h-16 w-16 text-red-500" />
                    </div>
                    <CardTitle className="text-2xl">
                        Pagamento Não Aprovado
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-600 mb-4">
                        Houve um problema ao processar seu pagamento. Por favor, tente novamente ou use outro método de pagamento.
                    </p>
                    {paymentId && (
                        <p className="text-sm text-gray-400">
                            ID do Pagamento: {paymentId}
                        </p>
                    )}
                </CardContent>
                <CardFooter className="flex justify-center">
                    <Link href="/pages/billing">
                        <Button variant="destructive" className="w-full">
                            Tentar Novamente
                        </Button>
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
}

export default function PaymentFailurePage() {
    return (
        <Suspense fallback={<div>Carregando...</div>}>
            <FailureContent />
        </Suspense>
    );
}
