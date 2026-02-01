import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createCost } from "@/app/api/billing/billing";
import { useSession } from "next-auth/react";
import GetCompany from "@/app/api/company/company";
import { useQuery } from "@tanstack/react-query";
import { notifyError, notifySuccess } from "@/app/utils/notifications";

const formSchema = z.object({
    cost_type: z.string().min(1, "Selecione o tipo de custo"),
    description: z.string().min(3, "Descrição deve ter no mínimo 3 caracteres"),
    amount: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, "Valor deve ser maior que 0"),
});

type FormValues = z.infer<typeof formSchema>;

interface RegisterCostDialogProps {
    onSuccess?: () => void;
}

export function RegisterCostDialog({ onSuccess }: RegisterCostDialogProps) {
    const { data: session } = useSession();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const { data: company } = useQuery({
        queryKey: ['company'],
        queryFn: () => GetCompany(session!),
        enabled: !!session?.user?.access_token,
    });

    const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            cost_type: "nfce",
            description: "",
            amount: "",
        },
    });

    const selectedType = watch("cost_type");

    const onSubmit = async (data: FormValues) => {
        if (!session || !company?.id) return;
        setLoading(true);
        try {
            await createCost(session, {
                cost_type: data.cost_type,
                description: data.description,
                amount: data.amount,
            });
            notifySuccess("Custo adicionado com sucesso!");
            setOpen(false);
            reset();
            onSuccess?.();
        } catch (error: any) {
            notifyError("Erro ao adicionar custo");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">Adicionar Custo</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Adicionar Custo de Uso</DialogTitle>
                    <DialogDescription>
                        Registre um novo custo manualmente para a empresa.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Tipo de Custo</Label>
                        <Select onValueChange={(val) => setValue("cost_type", val)} value={selectedType}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="nfce">NFC-e</SelectItem>
                                <SelectItem value="nfe">NF-e</SelectItem>
                                <SelectItem value="nfce_refund">Estorno NFC-e</SelectItem>
                                <SelectItem value="nfe_refund">Estorno NF-e</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.cost_type && <p className="text-sm text-red-500">{errors.cost_type.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label>Descrição</Label>
                        <Input {...register("description")} placeholder="Ex: Emissão extra" />
                        {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label>Valor (R$)</Label>
                        <Input {...register("amount")} placeholder="0.00" type="number" step="0.01" />
                        {errors.amount && <p className="text-sm text-red-500">{errors.amount.message}</p>}
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Salvando..." : "Salvar Custo"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
