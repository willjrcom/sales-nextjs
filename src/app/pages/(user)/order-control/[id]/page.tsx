'use client';

import { useParams } from "next/navigation";
import { CartAdded } from "@/app/components/order/cart/cart-added";

const PageEditOrderControl = () => {
    const { id } = useParams();

    return (<div className="w-full">
        <CartAdded orderId={id as string} />
    </div>
    );
}
export default PageEditOrderControl