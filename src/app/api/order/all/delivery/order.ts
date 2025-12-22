import Order from "@/app/entities/order/order";
import RequestApi, { AddAccessToken, GetAllResponse } from "../../../request";
import { Session } from "next-auth";

const GetOrdersWithDelivery = async (session: Session, page?: number, perPage?: number): Promise<GetAllResponse<Order>> => {
    const response = await RequestApi<null, Order[]>({
        path: "/order/all/delivery", 
        method: "GET",
        headers: AddAccessToken(session),
    });
    
    return {items: response.data, headers: response.headers}
};

export default GetOrdersWithDelivery