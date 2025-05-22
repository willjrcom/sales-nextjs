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

const PageNewOrderDelivery = () => {
    const [contact, setContact] = useState('');
    const [client, setClient] = useState<Client | null>();
    const [error, setError] = useState<RequestError | null>(null)
    const { data } = useSession();

    const search = async () => {
        if (!data) return
        try {
            const clientFound = await GetClientByContact(contact, data);
            if (clientFound.id !== '') {
                setClient(clientFound);
            }

            setError(null);
        } catch (error) {
            setClient(null);
            setError(error as RequestError);
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-center space-x-4">
                <div className="flex flex-col w-1/3">
                    <label htmlFor="contato" className="text-sm font-semibold mb-2 text-gray-700">Contato do Cliente</label>
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
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                    <FaSearch />
                    <span>Buscar</span>
                </button>
            </div>
            <div className="flex items-center justify-center space-x-4">
                {error && <p className="mb-4 text-red-500">{error.message}</p>}
            </div>
            
            {client && <CardClient client={client} />}
        </div>
    );
}

const CardClient = ({ client }: { client: Client | null | undefined }) => {
    const router = useRouter();
    const [error, setError] = useState<RequestError | null>(null);
    const { data } = useSession();

    const newOrder = async (client: Client) => {
        if (!data) return;
        try {
            const response = await NewOrderDelivery(client.id, data);
            router.push('/pages/order-control/' + response.order_id);
            setError(null);
        } catch (error) {
            setError(error as RequestError);
        }
    }

    if (!client) return <>{error && <p className="mb-4 text-red-500">{error.message}</p>}</>;

    return (
        <div className="bg-white rounded-lg shadow-md p-6 space-y-4 max-w-lg mx-auto">
            <h2 className="text-xl font-semibold text-gray-700">Cliente encontrado</h2>
            <div className="space-y-2">
                <p className="text-gray-600">Nome: <span className="font-semibold">{client.name}</span></p>
                <p className="text-gray-600">Endereço: {client.address.street}, {client.address.number}</p>
                <p className="text-gray-600">Bairro: {client.address.neighborhood}</p>
                <p className="text-gray-600">Cidade: {client.address.city}</p>
                <p className="text-gray-600">CEP: {client.address.cep}</p>
            </div>

            <div className="space-y-2">
                <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700">({client.contact.ddd}) {client.contact.number}</span>
                <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700">{client.cpf}</span>
            </div>

            {error && <p className="mb-4 text-red-500">{error.message}</p>}
            <button
                onClick={() => newOrder(client)}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
                <FaCheck />
                <span>Confirmar cliente</span>
            </button>
        </div>
    );
}

export default PageNewOrderDelivery;
