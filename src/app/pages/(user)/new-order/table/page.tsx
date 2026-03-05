'use client';

import RequestError from "@/app/utils/error";
import NewOrderTable from "@/app/api/order-table/new/order-table";
import Table from "@/app/entities/table/table";
import { SelectField, TextField } from "@/app/components/modal/field";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Loader2, Utensils, MapPin, User, Phone, Plus } from "lucide-react";
import { notifyError } from "@/app/utils/notifications";
import { useQuery } from '@tanstack/react-query';
import GetPlaces from '@/app/api/place/place';
import PatternField from "@/app/components/modal/fields/pattern";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const tableSchema = z.object({
    placeID: z.string().min(1, "O local é obrigatório."),
    tableID: z.string().min(1, "A mesa é obrigatória."),
    name: z.string().optional(),
    contact: z.string().optional().refine(val => !val || val.length === 11, {
        message: "Contato incompleto. Informe os 11 dígitos (DDD + número)."
    })
});

type TableFormData = z.infer<typeof tableSchema>;

const PageNewOrderTable = () => {
    const [isCreating, setIsCreating] = useState(false);
    const router = useRouter();
    const { data } = useSession();

    const { control, handleSubmit, formState: { errors }, watch, setValue } = useForm<TableFormData>({
        resolver: zodResolver(tableSchema),
        defaultValues: {
            placeID: '',
            tableID: '',
            name: '',
            contact: ''
        }
    });

    const placeIDValue = watch('placeID');
    const tableIDValue = watch('tableID');

    const { data: placesResponse } = useQuery({
        queryKey: ['places'],
        queryFn: () => GetPlaces(data!),
        enabled: !!(data as any)?.user?.access_token,
    });

    const places = useMemo(() => placesResponse?.items || [], [placesResponse?.items]);
    const selectedPlace = useMemo(() => {
        return places.find((p: any) => p.id === placeIDValue);
    }, [placeIDValue, places]);

    const tables = useMemo(() => {
        if (!selectedPlace) return [];
        const filteredTables: Table[] = [];
        for (const placeTable of (selectedPlace as any).tables) {
            filteredTables.push(placeTable.table);
        }
        return filteredTables;
    }, [selectedPlace]);

    const newOrder = async (formData: TableFormData) => {
        if (!data || isCreating) return;
        setIsCreating(true);
        try {
            const response = await NewOrderTable(data, formData.tableID, formData.name || '', formData.contact || '');
            router.push('/pages/order-control/' + response.order_id);
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
                        Atendimento em Mesa / Salão.
                    </p>
                </div>

                <Card className="border-none shadow-xl bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <Utensils className="w-5 h-5 text-blue-500" />
                                Localização e Cliente
                            </CardTitle>
                            <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-100">
                                Mesa
                            </Badge>
                        </div>
                        <CardDescription>
                            Selecione onde o cliente está sentado.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <form onSubmit={handleSubmit(newOrder)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1">
                                        <MapPin className="w-4 h-4" /> Local
                                    </div>
                                    <Controller
                                        name="placeID"
                                        control={control}
                                        render={({ field }) => (
                                            <SelectField
                                                friendlyName="Local"
                                                name={field.name}
                                                selectedValue={field.value}
                                                setSelectedValue={(val: string) => {
                                                    field.onChange(val);
                                                    setValue('tableID', ''); // Reset table when place changes
                                                }}
                                                values={places}
                                                error={errors.placeID?.message}
                                            />
                                        )}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1">
                                        <Utensils className="w-4 h-4" /> Mesa
                                    </div>
                                    <Controller
                                        name="tableID"
                                        control={control}
                                        render={({ field }) => (
                                            <SelectField
                                                friendlyName="Mesa"
                                                name={field.name}
                                                selectedValue={field.value}
                                                setSelectedValue={field.onChange}
                                                values={tables}
                                                disabled={!placeIDValue}
                                                error={errors.tableID?.message}
                                            />
                                        )}
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1">
                                        <User className="w-4 h-4" /> Nome (Opcional)
                                    </div>
                                    <Controller
                                        name="name"
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                placeholder="Identificação do cliente"
                                                name={field.name}
                                                optional
                                                value={field.value || ''}
                                                setValue={field.onChange}
                                                error={errors.name?.message}
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
                                                placeholder="(00) 00000-0000"
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
                                disabled={!tableIDValue || isCreating}
                                className="w-full h-14 text-lg font-bold shadow-lg shadow-blue-200/50 hover:shadow-blue-300/50 transform transition-all active:scale-[0.98] duration-200 bg-blue-600 hover:bg-blue-700"
                            >
                                {isCreating ? (
                                    <>
                                        <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                                        Iniciando...
                                    </>
                                ) : (
                                    <>
                                        <Plus className="mr-2 h-5 w-5" />
                                        Iniciar Atendimento
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

export default PageNewOrderTable;