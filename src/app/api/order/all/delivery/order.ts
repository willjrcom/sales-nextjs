import Order from "@/app/entities/order/order";
import RequestApi, { AddAccessToken, GetAllResponse } from "../../../request";
import { Session } from "next-auth";

const GetOrdersWithReadyDelivery = async (session: Session, page?: number, perPage?: number): Promise<GetAllResponse<Order>> => {
    const response = await RequestApi<null, Order[]>({
        path: "/order/all/delivery/ready?page=" + page + "&perPage=" + perPage,
        method: "GET",
        headers: AddAccessToken(session),
    });

    return { items: response.data, headers: response.headers }
};

const GetOrdersWithShippedDelivery = async (session: Session, page?: number, perPage?: number): Promise<GetAllResponse<Order>> => {
    const response = await RequestApi<null, Order[]>({
        path: "/order/all/delivery/shipped?page=" + page + "&perPage=" + perPage,
        method: "GET",
        headers: AddAccessToken(session),
    });

    return { items: response.data, headers: response.headers }
};

const GetOrdersWithFinishedDelivery = async (session: Session, page?: number, perPage?: number): Promise<GetAllResponse<Order>> => {
    const response = await RequestApi<null, Order[]>({
        path: "/order/all/delivery/finished?page=" + page + "&perPage=" + perPage,
        method: "GET",
        headers: AddAccessToken(session),
    });

    return { items: response.data, headers: response.headers }
};

export { GetOrdersWithReadyDelivery, GetOrdersWithShippedDelivery, GetOrdersWithFinishedDelivery }