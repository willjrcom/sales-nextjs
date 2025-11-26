'use client';

import { useCallback, useEffect } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import RequestError from "@/app/utils/error";
import { useCurrentOrder } from "@/app/context/current-order/context";
import { CartAdded } from "@/app/components/order/cart/cart-added";
import { CardOrderResume } from "@/app/components/order/resume/resume";
import { notifyError } from "@/app/utils/notifications";

const PageEditOrderControl = () => {
    const { id } = useParams();
    const { data } = useSession();
    const contextCurrentOrder = useCurrentOrder();

    const getOrder = useCallback(async () => {
        if (!id || !data) return;
        try {
            contextCurrentOrder.fetchData(id as string);
        } catch (error: RequestError | any) {
            notifyError(error.message || "Erro ao buscar pedido");
        }
    }, [data?.user.access_token, id]);

    useEffect(() => {
        getOrder();
    }, [data?.user.access_token]);

    return (<div className="w-full">
        <CartAdded />
        <CardOrderResume />
    </div>
    );
}
export default PageEditOrderControl