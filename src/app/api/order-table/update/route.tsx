import Order from "@/app/entities/order/order";
import RequestApi, { AddIdToken } from "../../request";
import { Session } from "next-auth";

const UpdateOrderTable = async (order: Order, session: Session): Promise<string> => {
    const response = await RequestApi<Order, string>({
        path: "/order-table/update/" + order.id, 
        method: "PATCH",
        body: order,
        headers: await AddIdToken(session),
    });

    return response.data
};

export default UpdateOrderTable