'use client';

import GetClientByContact from "@/app/api/client/contact/route";
import NewOrderDelivery from "@/app/api/order-delivery/new/route";
import Client from "@/app/entities/client/client";
import { TextField } from "@/app/forms/field";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaCheck, FaSearch } from "react-icons/fa";

const PageNewOrderDelivery = () => {
    const [contact, setContact] = useState('');
    const [client, setClient] = useState<Client | null>();
    const { data } = useSession();

    const search = async () => {
        if (!data) return
        const clientFound = await GetClientByContact(contact, data);

        if (clientFound.id !== '') {
            setClient(clientFound)
        }
    }
    return (
        <>
            <div className="flex items-center space-x-4">
                <div className="flex flex-col w-1/3">
                    <label htmlFor="contato" className="text-sm font-semibold mb-1">Entrega</label>
                    <TextField
                        name="contato"
                        placeholder="Digite o contato do cliente"
                        setValue={setContact}
                        value={contact}
                    />
                </div>
                <button
                    onClick={() => search()}
                    className="flex items-center space-x-2 p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 h-max"
                >
                    <FaSearch />
                    <span>Buscar</span>
                </button>
            </div>

            <CardClient client={client} />
        </>
    )
}


const CardClient = ({ client }: { client: Client | null | undefined }) => {
    const router = useRouter();
    const { data } = useSession();

    const newOrder = async (client: Client) => {
        event?.preventDefault();
        if (!data) return
        const response = await NewOrderDelivery(client.id, data)
        router.push('/pages/new-order/delivery/' + response.order_id)
    }

    if (!client) return <></>

    return (
        <>
            <br />
            <h2><b>Cliente encontrado:</b></h2>
            <br />
            <div className="max-w-sm rounded overflow-hidden shadow-lg">
                <div className="px-6 py-4">
                    <div className="font-bold text-xl mb-2">{client.name}</div>
                    <p className="text-gray-700 text-base">
                        Endereço: {client.address.street}, {client.address.number}<br />
                        Bairro: {client.address.neighborhood}<br />
                        Cidade: {client.address.city}<br />
                        Cep: {client.address.cep}

                    </p>
                </div>
                <div className="px-6 pt-4 pb-2">
                    <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">({client.contact.ddd}) {client.contact.number}</span>
                    <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">{client.cpf}</span>
                </div>
            </div>
            <br />

            <Link href={""} onClick={() => newOrder(client)}>
                <button className="flex items-center space-x-2 p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 w-max">
                    <FaCheck />
                    <span> Confirmar cliente</span>
                </button>
            </Link>
        </>
    )
}
export default PageNewOrderDelivery