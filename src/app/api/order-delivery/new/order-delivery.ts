import RequestApi, { AddAccessToken } from "../../request";
import { Session } from "next-auth";

interface NewDeliveryProps {
    delivery_id: string,
    order_id: string
}

const NewOrderDelivery = async (client_id: string, session: Session): Promise<NewDeliveryProps> => {
    const response = await RequestApi<Object, NewDeliveryProps>({
        path: "/order-delivery/new", 
        method: "POST",
        body: { client_id: client_id },
        headers: await AddAccessToken(session),
    });

    return response.data
};

export default NewOrderDelivery