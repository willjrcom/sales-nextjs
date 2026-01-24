'use client';

import GetClientByContact from "@/app/api/client/contact/client";
import RequestError from "@/app/utils/error";
import NewOrderDelivery from "@/app/api/order-delivery/new/order-delivery";
import Client from "@/app/entities/client/client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaCheck, FaSearch } from "react-icons/fa";
import PatternField from "@/app/components/modal/fields/pattern";
import { notifyError } from "@/app/utils/notifications";

const PageNewOrderDelivery = () => {
    const [contact, setContact] = useState('');
    const [client, setClient] = useState<Client | null>(null);
    const { data } = useSession();

    const search = async () => {
        if (!data) return
        try {
            const clientFound = await GetClientByContact(contact, data);
            if (clientFound.id !== '') {
                setClient(clientFound);
            }

        } catch (error: RequestError | any) {
            notifyError(error.message || 'Ocorreu um erro ao buscar o cliente');
            setClient(null);
        }
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-full p-6">
            <div className="w-full max-w-md space-y-6">
                <h1 className="text-2xl font-bold text-gray-800 text-center">
                    Novo Pedido - Delivery
                </h1>

                <div className="bg-white rounded-lg shadow p-6 space-y-6">
                    <div className="flex flex-col space-y-4">
                        <div>
                            <label
                                htmlFor="contato"
                                className="block text-sm font-semibold mb-1 text-gray-700"
                            >
                                Contato do Cliente
                            </label>
                            <PatternField
                                patternName="full-phone"
                                name="contato"
                                placeholder="Digite o contato do cliente"
                                setValue={setContact}
                                value={contact}
                                optional
                            />
                        </div>

                        <button
                            onClick={search}
                            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
                        >
                            <FaSearch />
                            <span>Buscar</span>
                        </button>
                    </div>

                    {client && <CardClient client={client} />}
                </div>
            </div>
        </div>
    );
};

const CardClient = ({ client }: { client: Client | null | undefined }) => {
    const router = useRouter();
    const { data } = useSession();

    const newOrder = async (client: Client) => {
        if (!data) return;
        try {
            const response = await NewOrderDelivery(client.id, data);
            router.push('/pages/order-control/' + response.order_id);
        } catch (error: RequestError | any) {
            notifyError(error.message || 'Ocorreu um erro ao criar o pedido');
        }
    }

    if (!client) return <p className="text-red-500">Cliente não encontrado</p>;

    return (
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">Cliente Encontrado</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Client Info */}
                <div className="space-y-2">
                    <p className="text-gray-700">Nome: <span className="font-semibold">{client.name}</span></p>
                    <p className="text-gray-700">Contato: <span className="font-semibold">{client.contact.number}</span></p>
                    <p className="text-gray-700">CPF: <span className="font-semibold">{client.cpf}</span></p>
                </div>
                {/* Address Info */}
                <div className="space-y-2">
                    <p className="text-gray-700">Endereço:</p>
                    <p className="ml-4 text-gray-600">{client.address.street}, {client.address.number}</p>
                    <p className="ml-4 text-gray-600">{client.address.neighborhood}</p>
                    <p className="ml-4 text-gray-600">{client.address.city} - {client.address.uf}</p>
                    <p className="ml-4 text-gray-600">CEP: {client.address.cep}</p>
                </div>
            </div>

            <button
                onClick={() => newOrder(client)}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
                <FaCheck />
                <span>Confirmar Cliente</span>
            </button>
        </div>
    );
};

export default PageNewOrderDelivery;
