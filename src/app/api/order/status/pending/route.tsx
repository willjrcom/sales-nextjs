import Order from "@/app/entities/order/order";
import RequestApi, { AddIdToken } from "../../../request";
import { Session } from "next-auth";

const PendingOrder = async (order: Order, session: Session): Promise<string> => {
    const response = await RequestApi<null, string>({
        path: "/order/pending/" + order.id, 
        method: "POST",
        headers: await AddIdToken(session),
    });

    return response.data
};

export default PendingOrder