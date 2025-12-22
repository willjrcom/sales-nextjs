import Order from "@/app/entities/order/order";
import RequestApi, { AddAccessToken } from "../../request";
import { Session } from "next-auth";

const GetDeliveryDriver = async (id: string, session: Session): Promise<string> => {
    const response = await RequestApi<Order, string>({
        path: "/delivery-driver/" + id, 
        method: "GET",
        headers: AddAccessToken(session),
    });

    return response.data
};

export default GetDeliveryDriver