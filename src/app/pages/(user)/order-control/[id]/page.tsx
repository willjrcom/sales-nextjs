'use client';

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import RequestError from "@/app/utils/error";
import { useCurrentOrder } from "@/app/context/current-order/context";
import { CartAdded } from "@/app/components/order/cart/cart-added";
import { CardOrderResume } from "@/app/components/order/resume/resume";

const PageEditOrderControl = () => {
    const { id } = useParams();
    const [error, setError] = useState<RequestError | null>(null)
    const { data } = useSession();
    const contextCurrentOrder = useCurrentOrder();

    const getOrder = useCallback(async () => {
        if (!id || !data) return;
        try {
            contextCurrentOrder.fetchData(id as string);
            setError(null);
        } catch (error) {
            setError(error as RequestError);
        }
    }, [data?.user.access_token, id]);

    useEffect(() => {
        getOrder();
    }, [data?.user.access_token]);

    return (<>
            <CartAdded />
            <CardOrderResume />
    </>
    );
}
export default PageEditOrderControl