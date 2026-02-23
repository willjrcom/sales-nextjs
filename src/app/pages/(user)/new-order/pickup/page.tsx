'use client';

import RequestError from "@/app/utils/error";
import NewOrderPickup from "@/app/api/order-pickup/new/order-pickup";
import { TextField } from "@/app/components/modal/field";
import PageTitle from "@/app/components/ui/page-title";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaPlus } from "react-icons/fa";
import { notifyError } from "@/app/utils/notifications";
import ThreeColumnHeader from "@/components/header/three-column-header";
import PatternField from "@/app/components/modal/fields/pattern";

const PageNewOrderPickup = () => {
    const [orderName, setOrderName] = useState('');
    const [contact, setContact] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const router = useRouter();
    const { data } = useSession();

    const newOrder = async (name: string, contact: string) => {
        if (!data || isCreating) return
        setIsCreating(true);
        try {
            const response = await NewOrderPickup(name, contact, data)
            router.push('/pages/order-control/' + response.order_id)
        } catch (error: RequestError | any) {
            notifyError(error.message || 'Ocorreu um erro ao criar o pedido');
            setIsCreating(false);
        }
    }

    return (
        <div className="flex flex-col items-center justify-center h-full space-y-6">
            <ThreeColumnHeader center={<PageTitle
                title="Balcão / Retirada"
                tooltip="Digite o nome e contato para o pedido de retirada."
            />} />
            <div className="w-full max-w-md bg-white p-6 rounded-md shadow space-y-2">
                <TextField
                    friendlyName="Nome"
                    name="orderName"
                    placeholder="Digite o nome do pedido"
                    setValue={setOrderName}
                    value={orderName}
                />
                <PatternField
                    friendlyName="Contato (WhatsApp)"
                    name="contact"
                    value={contact}
                    setValue={setContact}
                    patternName="full-phone"
                    optional
                />
            </div>
            <button
                disabled={orderName.length === 0 || isCreating}
                onClick={() => newOrder(orderName, contact)}
                className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed w-full max-w-md"
            >
                <FaPlus />
                <span>{isCreating ? 'Iniciando...' : 'Iniciar pedido'}</span>
            </button>
        </div>
    );
}

export default PageNewOrderPickup