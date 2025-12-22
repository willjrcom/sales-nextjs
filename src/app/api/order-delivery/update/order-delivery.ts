import Order from "@/app/entities/order/order";
import RequestApi, { AddAccessToken } from "../../request";
import { Session } from "next-auth";

const UpdateOrderDelivery = async (order: Order, session: Session): Promise<string> => {
    const response = await RequestApi<Order, string>({
        path: "/order-delivery/update/" + order.id, 
        method: "PATCH",
        body: order,
        headers: AddAccessToken(session),
    });

    return response.data
};

export default UpdateOrderDelivery