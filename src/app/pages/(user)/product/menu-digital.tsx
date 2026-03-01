import GetCompany from "@/app/api/company/company";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Check, Copy, ExternalLink, Info, Lock, AlertTriangle } from "lucide-react";
import { notify } from "@/app/utils/notifications";
import { useUser } from "@/app/context/user-context";
import AccessDenied from "@/app/components/access-denied";
import { GetSubscriptionStatus } from "@/app/api/company/subscription/status";
import { useRouter } from "next/navigation";
import { parseISO } from "date-fns";

const PageMenuDigital = () => {
    const { data: session } = useSession();
    const router = useRouter();
    const { hasPermission, user } = useUser();
    const [copied, setCopied] = useState(false);

    const { data: company } = useQuery({
        queryKey: ["company"],
        queryFn: () => GetCompany(session!),
        enabled: !!session?.user?.access_token,
    })

    const { isLoading, data: subscriptionStatus } = useQuery({
        queryKey: ["subscription-status"],
        queryFn: () => GetSubscriptionStatus(session!),
        enabled: !!session?.user?.access_token,
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL

    if (!user) {
        return <AccessDenied message="Usuário não encontrado ou sessão expirada." />;
    }

    if (!hasPermission('menu-digital')) {
        return <AccessDenied />
    }

    if (!appUrl) {
        return (
            <div className="p-4 text-red-500">
                Url do app não configurada
            </div>
        )
    }

    if (isLoading) {
        return (
            <div className="flex justify-center p-8">
                <span className="loading loading-spinner loading-md"></span>
            </div>
        )
    }

    const currentPlan = subscriptionStatus?.current_plan?.toLowerCase();
    const isBasicPlan = currentPlan === 'basic';
    const expiresAt = subscriptionStatus?.expires_at ? parseISO(subscriptionStatus.expires_at) : null;
    const isExpired = expiresAt ? expiresAt < new Date() : false;

    if (isBasicPlan) {
        return (
            <div className="p-6 max-w-2xl mx-auto space-y-6">
                <Card className="border-orange-200 bg-orange-50/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-orange-700">
                            <AlertTriangle className="h-5 w-5" />
                            Plano Básico Detectado
                        </CardTitle>
                        <CardDescription className="text-orange-600">
                            O recurso de **Menu Digital** está disponível apenas para os planos **Intermediário** e **Avançado**.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="text-sm text-orange-700">
                        <p>O seu plano atual (Básico) não permite a geração de links para menus digitais. Faça o upgrade agora para desbloquear este e outros recursos fiscais.</p>
                    </CardContent>
                    <CardFooter>
                        <Button
                            variant="default"
                            className="bg-orange-600 hover:bg-orange-700 w-full flex gap-2"
                            onClick={() => router.push('/pages/billing?tab=plans')}
                        >
                            Ver Planos de Upgrade
                            <ExternalLink className="h-4 w-4" />
                        </Button>
                    </CardFooter>
                </Card>

                <div className="opacity-40 pointer-events-none grayscale select-none">
                    <Label className="flex items-center gap-2 mb-2">
                        <Lock className="h-4 w-4" /> Link de Entregas (Bloqueado)
                    </Label>
                    <Input value="https://app.gfood.com.br/pages/delivery?q=..." readOnly />
                </div>
            </div>
        )
    }

    // status is expired
    if (isExpired) {
        return (
            <div className="p-6 max-w-2xl mx-auto space-y-6">
                <Card className="border-red-200 bg-red-50/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-700">
                            <AlertTriangle className="h-5 w-5" />
                            Assinatura Expirada
                        </CardTitle>
                        <CardDescription className="text-red-600">
                            O recurso de **Menu Digital** está bloqueado porque sua assinatura expirou.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="text-sm text-red-700">
                        <p>Para voltar a utilizar o menu digital e outros recursos, por favor regularize sua assinatura na página de faturamento.</p>
                    </CardContent>
                    <CardFooter>
                        <Button
                            variant="destructive"
                            className="bg-red-600 hover:bg-red-700 w-full flex gap-2"
                            onClick={() => router.push('/pages/billing?tab=plans')}
                        >
                            Regularizar Assinatura
                            <ExternalLink className="h-4 w-4" />
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        )
    }

    if (!company) {
        return (
            <div className="flex justify-center p-8">
                <span className="loading loading-spinner loading-md"></span>
            </div>
        )
    }

    const encodedSchemaName = btoa(company.schema_name)
    const urlDelivery = `${appUrl}/pages/delivery?q=${encodedSchemaName}`
    const urlTable = `${appUrl}/pages/table?q=${encodedSchemaName}`
    const urlPickup = `${appUrl}/pages/pickup?q=${encodedSchemaName}`

    const handleCopy = () => {
        navigator.clipboard.writeText(urlDelivery);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        notify("Link copiado para a área de transferência!");
    };

    return (
        <Card className="w-full max-w-2xl mx-auto mt-8">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <span className="material-symbols-outlined">qr_code_2</span>
                    Menu Digital
                </CardTitle>
                <CardDescription>
                    Compartilhe este link com seus clientes para que eles possam acessar seu cardápio digital.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="menu-link">Link de Entregas</Label>
                    <div className="flex gap-2">
                        <Input
                            id="menu-link"
                            value={urlDelivery}
                            readOnly
                            className="bg-gray-50 font-mono text-sm"
                        />
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={handleCopy}
                                        className={copied ? "text-green-600 border-green-600 bg-green-50" : ""}
                                    >
                                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{copied ? "Copiado!" : "Copiar link"}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => window.open(urlDelivery, '_blank')}
                                    >
                                        <ExternalLink className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Acessar link</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-md p-4 text-sm text-blue-700 flex gap-3 items-start">
                    <Info className="h-5 w-5 shrink-0 mt-0.5" />
                    <p>
                        Este link permite que seus clientes acessem a página de entregas da <strong>{company.trade_name}</strong>.
                    </p>
                </div>
            </CardContent>

            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="menu-link">Link de Mesas</Label>
                    <div className="flex gap-2">
                        <Input
                            id="menu-link"
                            value={urlTable}
                            readOnly
                            className="bg-gray-50 font-mono text-sm"
                        />
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={handleCopy}
                                        className={copied ? "text-green-600 border-green-600 bg-green-50" : ""}
                                    >
                                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{copied ? "Copiado!" : "Copiar link"}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => window.open(urlTable, '_blank')}
                                    >
                                        <ExternalLink className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Acessar link</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-md p-4 text-sm text-blue-700 flex gap-3 items-start">
                    <Info className="h-5 w-5 shrink-0 mt-0.5" />
                    <p>
                        Este link permite que seus clientes acessem a página de mesas da <strong>{company.trade_name}</strong>.
                    </p>
                </div>
            </CardContent>

            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="menu-link">Link de Retirada/Balcão</Label>
                    <div className="flex gap-2">
                        <Input
                            id="menu-link"
                            value={urlPickup}
                            readOnly
                            className="bg-gray-50 font-mono text-sm"
                        />
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={handleCopy}
                                        className={copied ? "text-green-600 border-green-600 bg-green-50" : ""}
                                    >
                                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{copied ? "Copiado!" : "Copiar link"}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => window.open(urlPickup, '_blank')}
                                    >
                                        <ExternalLink className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Acessar link</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-md p-4 text-sm text-blue-700 flex gap-3 items-start">
                    <Info className="h-5 w-5 shrink-0 mt-0.5" />
                    <p>
                        Este link permite que seus clientes acessem a página de retirada/balcão da <strong>{company.trade_name}</strong>.
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}

export default PageMenuDigital