'use client';

import RequestError from "@/app/utils/error";
import NewOrderPickup from "@/app/api/order-pickup/new/order-pickup";
import { TextField } from "@/app/components/modal/field";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, User, Phone, ShoppingBag, Plus } from "lucide-react";
import { notifyError } from "@/app/utils/notifications";
import PatternField from "@/app/components/modal/fields/pattern";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const pickupSchema = z.object({
    orderName: z.string().min(1, "O nome ou identificação é obrigatório."),
    contact: z.string().optional().refine(val => !val || val.length === 11, {
        message: "Contato incompleto. Informe os 11 dígitos (DDD + número)."
    })
});

type PickupFormData = z.infer<typeof pickupSchema>;

const PageNewOrderPickup = () => {
    const [isCreating, setIsCreating] = useState(false);
    const router = useRouter();
    const { data } = useSession();

    const { control, handleSubmit, formState: { errors }, watch } = useForm<PickupFormData>({
        resolver: zodResolver(pickupSchema),
        defaultValues: {
            orderName: '',
            contact: ''
        }
    });

    const orderNameValue = watch('orderName');

    const newOrder = async (formData: PickupFormData) => {
        if (!data || isCreating) return
        setIsCreating(true);
        try {
            const response = await NewOrderPickup(formData.orderName, formData.contact || '', data)
            router.push('/pages/order-control/' + response.order_id)
        } catch (error: RequestError | any) {
            notifyError(error.message || 'Ocorreu um erro ao criar o pedido');
            setIsCreating(false);
        }
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] p-4 bg-gray-50/50">
            <div className="w-full max-w-xl space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                        Novo Pedido
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        Balcão / Retirada rápida.
                    </p>
                </div>

                <Card className="border-none shadow-xl bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <ShoppingBag className="w-5 h-5 text-orange-500" />
                                Dados do Pedido
                            </CardTitle>
                            <Badge variant="secondary" className="bg-orange-50 text-orange-700 border-orange-100">
                                Retirada
                            </Badge>
                        </div>
                        <CardDescription>
                            Informe o nome ou identificação do cliente.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <form onSubmit={handleSubmit(newOrder)} className="space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1">
                                        <User className="w-4 h-4" /> Nome / Identificação
                                    </div>
                                    <Controller
                                        name="orderName"
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                name={field.name}
                                                placeholder="Ex: João da Silva ou Mesa 05"
                                                setValue={field.onChange}
                                                value={field.value}
                                                error={errors.orderName?.message}
                                            />
                                        )}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1">
                                        <Phone className="w-4 h-4" /> Contato (Opcional)
                                    </div>
                                    <Controller
                                        name="contact"
                                        control={control}
                                        render={({ field }) => (
                                            <PatternField
                                                name={field.name}
                                                value={field.value || ''}
                                                setValue={field.onChange}
                                                patternName="full-phone"
                                                error={errors.contact?.message}
                                                optional
                                            />
                                        )}
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={!orderNameValue || isCreating}
                                className="w-full h-14 text-lg font-bold shadow-lg shadow-orange-200/50 hover:shadow-orange-300/50 transform transition-all active:scale-[0.98] duration-200 bg-orange-600 hover:bg-orange-700"
                            >
                                {isCreating ? (
                                    <>
                                        <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                                        Iniciando...
                                    </>
                                ) : (
                                    <>
                                        <Plus className="mr-2 h-5 w-5" />
                                        Abrir Pedido no Balcão
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default PageNewOrderPickup;