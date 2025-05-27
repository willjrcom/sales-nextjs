import Order from "@/app/entities/order/order";
import RequestApi, { AddAccessToken } from "../../request";
import { Session } from "next-auth";

const NewOrder = async (order: Order, session: Session): Promise<string> => {
    const response = await RequestApi<Order, string>({
        path: "/order/new", 
        method: "POST",
        body: order,
        headers: await AddAccessToken(session),
    });

    return response.data
};

export default NewOrder