import Order from "@/app/entities/order/order";
import RequestApi, { AddIdToken } from "../../../request";
import { Session } from "next-auth";

const FinishOrder = async (order: Order, session: Session): Promise<string> => {
    const response = await RequestApi<null, string>({
        path: "/order/finish/" + order.id, 
        method: "POST",
        headers: await AddIdToken(session),
    });

    return response.data
};

export default FinishOrder