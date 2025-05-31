import Order from "@/app/entities/order/order";
import RequestApi, { AddAccessToken, GetAllResponse } from "../request";
import { Session } from "next-auth";

const GetOrders = async (session: Session): Promise<GetAllResponse<Order>> => {
    const response = await RequestApi<null, Order[]>({
        path: "/order/all",
        method: "GET",
        headers: await AddAccessToken(session),
    });
    return { items: response.data, headers: response.headers }
};

export default GetOrders