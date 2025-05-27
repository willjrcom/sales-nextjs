import Order from "@/app/entities/order/order";
import RequestApi, { AddAccessToken } from "../request";
import { Session } from "next-auth";

const GetOrders = async (session: Session): Promise<Order[]> => {
    const response = await RequestApi<null, Order[]>({
        path: "/order/all", 
        method: "GET",
        headers: await AddAccessToken(session),
    });
    return response.data
};

export default GetOrders