'use client';

import RequestError from "@/app/utils/error";
import NewOrderPickup from "@/app/api/order-pickup/new/order-pickup";
import { TextField } from "@/app/components/modal/field";
import PageTitle from "@/app/components/PageTitle";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaPlus } from "react-icons/fa";

const PageNewOrderPickup = () => {
    const [orderName, setOrderName] = useState('');
    const [error, setError] = useState<RequestError | null>(null)
    const router = useRouter();
    const { data } = useSession();

    const newOrder = async (name: string) => {
        if (!data) return
        try {
            const response = await NewOrderPickup(name, data)
            router.push('/pages/order-control/' + response.order_id)
            setError(null)
        } catch (error) {
            setError(error as RequestError)
        }
    }

    return (
        <div className="flex flex-col items-center justify-center h-full space-y-6">
            <PageTitle
                title="Balcão / Retirada"
                tooltip="Digite o nome a ser exibido no pedido de retirada."
            />
            <div className="w-full max-w-md">
                <TextField
                    name="orderName"
                    placeholder="Digite o nome do pedido"
                    setValue={setOrderName}
                    value={orderName}
                    optional
                />
            </div>
            <button
                disabled={orderName.length === 0}
                onClick={() => newOrder(orderName)}
                className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed w-full max-w-md"
            >
                <FaPlus />
                <span>Iniciar pedido</span>
            </button>
            {error && <p className="text-red-500">{error.message}</p>}
        </div>
    );
}

export default PageNewOrderPickup