import Order from "@/app/entities/order/order";
import RequestApi, { AddIdToken } from "../../request";
import { Session } from "next-auth";

const GetOrderByID = async (id: string, session: Session): Promise<Order> => {
    const response = await RequestApi<string, Order>({
        path: "/order/" + id, 
        method: "GET",
        headers: await AddIdToken(session),
    });
    return response.data
};

export default GetOrderByID