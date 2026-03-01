"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, CreditCard, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function SubscriptionOverlay() {
    return (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-500">
            <Card className="max-w-md w-full border-2 border-amber-200 shadow-2xl animate-in zoom-in-95 duration-500">
                <CardHeader className="text-center pb-2">
                    <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                        <AlertCircle className="w-10 h-10 text-amber-600" />
                    </div>
                    <CardTitle className="text-2xl font-black tracking-tight text-gray-900">
                        Assinatura Necessária
                    </CardTitle>
                    <CardDescription className="text-gray-500 font-medium">
                        Ops! Parece que seu plano expirou ou não está ativo.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-4">
                    <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                        <p className="text-sm text-amber-800 leading-relaxed text-center">
                            Para continuar realizando pedidos e gerenciando suas vendas, você precisa ativar um plano de assinatura.
                        </p>
                    </div>

                    <div className="flex flex-col gap-3">
                        <Button asChild className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl shadow-lg transition-all duration-300 hover:scale-[1.02] group">
                            <Link href="/pages/billing?tab=plans" className="flex items-center justify-center gap-2">
                                <CreditCard className="w-5 h-5" />
                                Ver Planos Disponíveis
                                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </Button>

                        <p className="text-[10px] text-center text-gray-400 font-bold uppercase tracking-widest">
                            Ambiente Restrito
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
