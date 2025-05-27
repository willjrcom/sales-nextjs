import RequestApi, { AddAccessToken } from "../request";
import { Session } from "next-auth";
import OrderDelivery from "@/app/entities/order/order-delivery";

const GetDeliveryOrders = async (session: Session): Promise<OrderDelivery[]> => {
    const response = await RequestApi<null, OrderDelivery[]>({
        path: "/order-delivery/all", 
        method: "GET",
        headers: await AddAccessToken(session),
    });
    return response.data
};

export default GetDeliveryOrders