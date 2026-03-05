'use client';

import GetClientByContact from "@/app/api/client/contact/client";
import RequestError from "@/app/utils/error";
import NewOrderDelivery from "@/app/api/order-delivery/new/order-delivery";
import Client from "@/app/entities/client/client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaCheck } from "react-icons/fa";
import { Loader2, User, MapPin, Phone, CreditCard, Search } from "lucide-react";
import PatternField from "@/app/components/modal/fields/pattern";
import { notifyError } from "@/app/utils/notifications";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const searchSchema = z.object({
    contact: z.string().optional().refine(val => !val || val.length === 11, {
        message: "Contato incompleto. Informe os 11 dígitos (DDD + número)."
    })
});

type SearchFormData = z.infer<typeof searchSchema>;

const PageNewOrderDelivery = () => {
    const [client, setClient] = useState<Client | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const { data } = useSession();

    const { control, handleSubmit, formState: { errors }, watch } = useForm<SearchFormData>({
        resolver: zodResolver(searchSchema),
        defaultValues: {
            contact: ''
        }
    });

    const contactValue = watch('contact');

    const search = async (formData: SearchFormData) => {
        if (!data || isSearching) return
        setIsSearching(true);
        try {
            const clientFound = await GetClientByContact(formData.contact || '', data);
            if (clientFound.id !== '') {
                setClient(clientFound);
            } else {
                notifyError('Cliente não encontrado');
                setClient(null);
            }

        } catch (error: RequestError | any) {
            notifyError(error.message || 'Ocorreu um erro ao buscar o cliente');
            setClient(null);
        } finally {
            setIsSearching(false);
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
                        Identifique o cliente para iniciar a entrega.
                    </p>
                </div>

                <Card className="border-none shadow-xl bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Search className="w-5 h-5 text-blue-500" />
                            Buscar Cliente
                        </CardTitle>
                        <CardDescription>
                            Digite o número de telefone ou celular cadastrado.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <form onSubmit={handleSubmit(search)}>
                                <Controller
                                    name="contact"
                                    control={control}
                                    render={({ field }) => (
                                        <PatternField
                                            patternName="full-phone"
                                            name={field.name}
                                            placeholder="Ex: (11) 99999-9999"
                                            setValue={field.onChange}
                                            value={field.value || ''}
                                            error={errors.contact?.message}
                                            optional
                                        />
                                    )}
                                />

                                <Button
                                    type="submit"
                                    disabled={isSearching || !contactValue}
                                    className="w-full h-12 text-lg font-medium transition-all duration-200"
                                >
                                    {isSearching ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            Buscando...
                                        </>
                                    ) : (
                                        <>
                                            <Search className="mr-2 h-5 w-5" />
                                            Localizar Cliente
                                        </>
                                    )}
                                </Button>
                            </form>
                        </div>
                    </CardContent>

                    {client && (
                        <div className="px-6 pb-6 animate-in fade-in slide-in-from-top-4 duration-300">
                            <Separator className="mb-6" />
                            <CardClient client={client} isCreating={isCreating} setIsCreating={setIsCreating} />
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

const CardClient = ({ client, isCreating, setIsCreating }: { client: Client | null | undefined, isCreating: boolean, setIsCreating: (v: boolean) => void }) => {
    const router = useRouter();
    const { data } = useSession();

    const newOrder = async (client: Client) => {
        if (!data || isCreating) return;
        setIsCreating(true);
        try {
            const response = await NewOrderDelivery(client.id, data);
            router.push('/pages/order-control/' + response.order_id);
        } catch (error: RequestError | any) {
            notifyError(error.message || 'Ocorreu um erro ao criar o pedido');
            setIsCreating(false);
        }
    }

    if (!client) return <p className="text-red-500">Cliente não encontrado</p>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <Badge variant="secondary" className="px-3 py-1 text-sm font-medium bg-green-50 text-green-700 border-green-100 hover:bg-green-50 uppercase tracking-wider">
                    Cliente Localizado
                </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Informações Pessoais */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-tight flex items-center gap-2">
                        <User className="w-4 h-4" /> Dados Pessoais
                    </h3>
                    <div className="space-y-3 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                        <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground uppercase font-semibold">Nome Completo</span>
                            <span className="text-gray-900 font-medium">{client.name}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground uppercase font-semibold">Telefone</span>
                            <div className="flex items-center gap-2 text-gray-900 font-medium mt-1">
                                <Phone className="w-3.5 h-3.5 text-blue-500" />
                                {client.contact.number}
                            </div>
                        </div>
                        {client.cpf && (
                            <div className="flex flex-col">
                                <span className="text-xs text-muted-foreground uppercase font-semibold">CPF</span>
                                <div className="flex items-center gap-2 text-gray-900 font-medium mt-1">
                                    <CreditCard className="w-3.5 h-3.5 text-blue-500" />
                                    {client.cpf}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Informações de Endereço */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-tight flex items-center gap-2">
                        <MapPin className="w-4 h-4" /> Endereço de Entrega
                    </h3>
                    <div className="space-y-3 bg-gray-50/50 p-4 rounded-xl border border-gray-100 h-full">
                        <p className="text-gray-900 font-medium leading-relaxed">
                            {client.address.street}, {client.address.number}<br />
                            {client.address.complement && (
                                <span className="text-sm text-muted-foreground block italic mb-1">
                                    {client.address.complement}
                                </span>
                            )}
                            <span className="text-sm text-gray-600 block">
                                {client.address.neighborhood} - {client.address.city}/{client.address.uf}
                            </span>
                            <span className="text-sm font-mono text-gray-500 block mt-1">
                                CEP: {client.address.cep}
                            </span>
                        </p>
                    </div>
                </div>
            </div>

            <Button
                onClick={() => newOrder(client)}
                disabled={isCreating}
                className="w-full h-14 text-lg font-bold shadow-lg shadow-blue-200/50 hover:shadow-blue-300/50 transform transition-all active:scale-[0.98] duration-200 bg-blue-600 hover:bg-blue-700"
            >
                {isCreating ? (
                    <>
                        <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                        Criando Pedido...
                    </>
                ) : (
                    <>
                        <FaCheck className="mr-2 h-5 w-5" />
                        Iniciar Novo Pedido
                    </>
                )}
            </Button>
        </div>
    );
};

export default PageNewOrderDelivery;
