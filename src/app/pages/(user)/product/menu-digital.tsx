import GetCompany from "@/app/api/company/company";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Check, Copy, ExternalLink, Info } from "lucide-react";
import { notify } from "@/app/utils/notifications";

const PageMenuDigital = () => {
    const { data: session } = useSession();
    const [copied, setCopied] = useState(false);

    const { data: company } = useQuery({
        queryKey: ["company"],
        queryFn: () => GetCompany(session!),
        enabled: !!session?.user?.access_token,
    })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL

    if (!appUrl) {
        return (
            <div className="p-4 text-red-500">
                Url do app não configurada
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