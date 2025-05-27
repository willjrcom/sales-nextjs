import RequestApi, { AddAccessToken } from "../request";
import { Session } from "next-auth";
import OrderPickup from "@/app/entities/order/order-pickup";

const GetOrderPickups = async (session: Session): Promise<OrderPickup[]> => {
    const response = await RequestApi<null, OrderPickup[]>({
        path: "/order-pickup/all", 
        method: "GET",
        headers: await AddAccessToken(session),
    });
    return response.data
};

export default GetOrderPickups