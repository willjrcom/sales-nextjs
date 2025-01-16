import Order from "@/app/entities/order/order";
import RequestApi, { AddIdToken } from "../../../request";
import { Session } from "next-auth";

const GetOrdersWithDelivery = async (session: Session): Promise<Order[]> => {
    const response = await RequestApi<null, Order[]>({
        path: "/order/all/delivery", 
        method: "GET",
        headers: await AddIdToken(session),
    });
    return response.data
};

export default GetOrdersWithDelivery