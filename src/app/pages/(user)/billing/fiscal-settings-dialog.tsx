import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { notifyError, notifySuccess } from "@/app/utils/notifications";
import { getFiscalSettings, updateFiscalSettings, FiscalSettingsUpdateDTO } from "@/app/api/fiscal-settings/fiscal-settings";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export function FiscalSettingsDialog() {
    const { data: session } = useSession();
    const [open, setOpen] = useState(false);
    const queryClient = useQueryClient();

    const { register, handleSubmit, control, reset, setValue, watch } = useForm<FiscalSettingsUpdateDTO>({
        defaultValues: {
            fiscal_enabled: false,
            tax_regime: 1,
            is_simple_national: true,
            show_tax_breakdown: false,
            send_email_to_recipient: true,
        },
    });

    const { data: settings, isLoading } = useQuery({
        queryKey: ['fiscal-settings'],
        queryFn: () => getFiscalSettings(session!),
        enabled: !!session?.user?.access_token && open,
    });

    useEffect(() => {
        if (settings) {
            reset({
                fiscal_enabled: settings.fiscal_enabled,
                state_registration: settings.state_registration,
                tax_regime: settings.tax_regime || 1,
                cnae: settings.cnae,
                crt: settings.crt || 1,
                municipal_registration: settings.municipal_registration,
                show_tax_breakdown: settings.show_tax_breakdown,
                send_email_to_recipient: settings.send_email_to_recipient,
                business_name: settings.business_name,
                trade_name: settings.trade_name,
                cnpj: settings.cnpj,
                email: settings.email,
                phone: settings.phone,
                street: settings.street,
                number: settings.number,
                complement: settings.complement,
                neighborhood: settings.neighborhood,
                city: settings.city,
                uf: settings.uf,
                cep: settings.cep,
                csc_production_id: settings.csc_production_id,
                csc_production_code: settings.csc_production_code,
                csc_homologation_id: settings.csc_homologation_id,
                csc_homologation_code: settings.csc_homologation_code,
            });
        }
    }, [settings, reset]);

    const updateMutation = useMutation({
        mutationFn: (data: FiscalSettingsUpdateDTO) => updateFiscalSettings(session!, data),
        onSuccess: () => {
            notifySuccess("Configurações fiscais atualizadas com sucesso!");
            setOpen(false);
            queryClient.invalidateQueries({ queryKey: ['fiscal-settings'] });
        },
        onError: (error: any) => {
            notifyError(error?.message || "Erro ao atualizar configurações fiscais");
        },
    });

    const onSubmit = (data: FiscalSettingsUpdateDTO) => {
        // Convert types if necessary (e.g. string to number for tax_regime if select returns string)
        const payload = { ...data };
        if (payload.tax_regime) payload.tax_regime = Number(payload.tax_regime);
        if (payload.crt) payload.crt = Number(payload.crt);

        updateMutation.mutate(payload);
    };

    const fiscalEnabled = watch("fiscal_enabled");

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">Configuração Fiscal</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px] h-[90vh] flex flex-col p-0">
                <DialogHeader className="px-6 pt-6 pb-2">
                    <DialogTitle>Configurações Fiscais (Focus NFe)</DialogTitle>
                    <DialogDescription>
                        Configure os dados da sua empresa para emissão de notas fiscais.
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="flex-1 px-6">
                    <form id="fiscal-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6 pb-6">

                        <div className="flex items-center space-x-2 border p-4 rounded bg-muted/20">
                            <Controller
                                control={control}
                                name="fiscal_enabled"
                                render={({ field }) => (
                                    <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        id="fiscal_enabled"
                                    />
                                )}
                            />
                            <Label htmlFor="fiscal_enabled" className="font-semibold cursor-pointer">Habilitar Emissão Fiscal</Label>
                        </div>

                        {fiscalEnabled && (
                            <>
                                <div className="space-y-4">
                                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Dados Tributários</h3>
                                    <Separator />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="tax_regime">Regime Tributário</Label>
                                            <Controller
                                                control={control}
                                                name="tax_regime"
                                                render={({ field }) => (
                                                    <Select onValueChange={(v: string) => field.onChange(Number(v))} value={String(field.value || 1)}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Selecione" />
                                                        </SelectTrigger>
                                                        <SelectContent className="z-[10002]">
                                                            <SelectItem value="1">1 - Simples Nacional</SelectItem>
                                                            <SelectItem value="3">3 - Regime Normal</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="crt">CRT</Label>
                                            <Controller
                                                control={control}
                                                name="crt"
                                                render={({ field }) => (
                                                    <Select onValueChange={(v: string) => field.onChange(Number(v))} value={String(field.value || 1)}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Selecione" />
                                                        </SelectTrigger>
                                                        <SelectContent className="z-[10002]">
                                                            <SelectItem value="1">1 - Simples Nacional</SelectItem>
                                                            <SelectItem value="2">2 - Simples Nacional (Excesso)</SelectItem>
                                                            <SelectItem value="3">3 - Regime Normal</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="cnae">CNAE Principal</Label>
                                            <Input id="cnae" {...register("cnae")} placeholder="Ex: 4712100" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="state_registration">Inscrição Estadual</Label>
                                            <Input id="state_registration" {...register("state_registration")} placeholder="Somente números" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="municipal_registration">Inscrição Municipal</Label>
                                            <Input id="municipal_registration" {...register("municipal_registration")} placeholder="Somente números" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Identificação da Empresa</h3>
                                    <Separator />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="business_name">Razão Social</Label>
                                            <Input id="business_name" {...register("business_name")} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="trade_name">Nome Fantasia</Label>
                                            <Input id="trade_name" {...register("trade_name")} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="cnpj">CNPJ</Label>
                                            <Input id="cnpj" {...register("cnpj")} placeholder="00.000.000/0000-00" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email Fiscal</Label>
                                            <Input id="email" type="email" {...register("email")} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="phone">Telefone</Label>
                                            <Input id="phone" {...register("phone")} />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Endereço Fiscal</h3>
                                    <Separator />
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-2 col-span-1">
                                            <Label htmlFor="cep">CEP</Label>
                                            <Input id="cep" {...register("cep")} />
                                        </div>
                                        <div className="space-y-2 col-span-2">
                                            <Label htmlFor="street">Logradouro</Label>
                                            <Input id="street" {...register("street")} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="number">Número</Label>
                                            <Input id="number" {...register("number")} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="complement">Complemento</Label>
                                            <Input id="complement" {...register("complement")} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="neighborhood">Bairro</Label>
                                            <Input id="neighborhood" {...register("neighborhood")} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="city">Cidade</Label>
                                            <Input id="city" {...register("city")} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="uf">UF</Label>
                                            <Input id="uf" {...register("uf")} maxLength={2} />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Credenciais NFC-e (CSC)</h3>
                                    <Separator />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="md:col-span-2">
                                            <p className="text-sm text-muted-foreground mb-4">
                                                O CSC (Código de Segurança do Contribuinte) é obrigatório para emissão de NFC-e.
                                                Você pode obter esses códigos no portal da SEFAZ do seu estado.
                                            </p>
                                        </div>

                                        <div className="space-y-4 border p-4 rounded-md">
                                            <h4 className="font-semibold text-sm">Ambiente de PRODUÇÃO</h4>
                                            <div className="space-y-2">
                                                <Label htmlFor="csc_production_id">ID do Token (Ex: 000001)</Label>
                                                <Input id="csc_production_id" {...register("csc_production_id")} placeholder="000001" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="csc_production_code">Código CSC (Alfanumérico)</Label>
                                                <Input id="csc_production_code" {...register("csc_production_code")} type="password" />
                                            </div>
                                        </div>

                                        <div className="space-y-4 border p-4 rounded-md bg-muted/10">
                                            <h4 className="font-semibold text-sm">Ambiente de HOMOLOGAÇÃO (Testes)</h4>
                                            <div className="space-y-2">
                                                <Label htmlFor="csc_homologation_id">ID do Token (Ex: 000001)</Label>
                                                <Input id="csc_homologation_id" {...register("csc_homologation_id")} placeholder="000001" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="csc_homologation_code">Código CSC (Alfanumérico)</Label>
                                                <Input id="csc_homologation_code" {...register("csc_homologation_code")} type="password" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Preferências</h3>
                                    <Separator />
                                    <div className="space-y-3">
                                        <div className="flex items-center space-x-2">
                                            <Controller
                                                control={control}
                                                name="show_tax_breakdown"
                                                render={({ field }) => (
                                                    <Switch
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                        id="show_tax_breakdown"
                                                    />
                                                )}
                                            />
                                            <Label htmlFor="show_tax_breakdown">Discriminar impostos na nota (Lei da Transparência)</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Controller
                                                control={control}
                                                name="send_email_to_recipient"
                                                render={({ field }) => (
                                                    <Switch
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                        id="send_email_to_recipient"
                                                    />
                                                )}
                                            />
                                            <Label htmlFor="send_email_to_recipient">Enviar email automático para o destinatário</Label>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                    </form>
                </ScrollArea>

                <DialogFooter className="mr-6 mb-6">
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                    <Button onClick={handleSubmit(onSubmit)} disabled={updateMutation.isPending || isLoading}>
                        {updateMutation.isPending ? "Salvando..." : "Salvar Alterações"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
