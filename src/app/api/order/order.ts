import Order from "@/app/entities/order/order";
import RequestApi, { AddAccessToken, GetAllResponse } from "../request";
import { Session } from "next-auth";

const GetOpenedOrders = async (session: Session): Promise<GetAllResponse<Order>> => {
    const response = await RequestApi<null, Order[]>({
        path: "/order/all/opened",
        method: "GET",
        headers: AddAccessToken(session),
    });
    return { items: response.data, headers: response.headers }
};

const GetClosedOrders = async (session: Session): Promise<GetAllResponse<Order>> => {
    const response = await RequestApi<null, Order[]>({
        path: "/order/all/closed",
        method: "GET",
        headers: AddAccessToken(session),
    });
    return { items: response.data, headers: response.headers }
};

export { GetOpenedOrders, GetClosedOrders }