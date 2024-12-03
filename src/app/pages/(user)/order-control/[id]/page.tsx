'use client';

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import RequestError from "@/app/api/error";
import OrderManager from "@/app/components/order/order";
import { useCurrentOrder } from "@/app/context/current-order/context";

const PageEditOrderControl = () => {
    const { id } = useParams();
    const [error, setError] = useState<RequestError | null>(null)
    const { data } = useSession();
    const context = useCurrentOrder();

    const getOrder = useCallback(async () => {
        if (!id || !data) return;
        try {
            context.fetchData(id as string);
            setError(null);
        } catch (error) {
            setError(error as RequestError);
        }
    }, [data, id, context]);

    useEffect(() => {
        getOrder();
    }, [data, getOrder]);


    if (!id || !context.order) {
        return (
            <>
            {error && <p className="mb-4 text-red-500">{error.message}</p>}
            <h1>Pedido não encontrado</h1>
            </>
        )
    }

    return (
        <OrderManager />
    );
}
export default PageEditOrderControl