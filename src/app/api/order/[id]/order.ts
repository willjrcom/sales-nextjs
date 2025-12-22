import Order from "@/app/entities/order/order";
import RequestApi, { AddAccessToken } from "../../request";
import { Session } from "next-auth";

const GetOrderByID = async (id: string, session: Session): Promise<Order> => {
    const response = await RequestApi<string, Order>({
        path: "/order/" + id, 
        method: "GET",
        headers: AddAccessToken(session),
    });
    return response.data
};

export default GetOrderByID