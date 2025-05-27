import RequestApi, { AddAccessToken } from "../../request";
import { Session } from "next-auth";

interface NewPickupProps {
    order_id: string
}

const NewOrderPickup = async (name: string, session: Session): Promise<NewPickupProps> => {
    const response = await RequestApi<Object, NewPickupProps>({
        path: "/order-pickup/new", 
        method: "POST",
        body: { name: name },
        headers: await AddAccessToken(session),
    });

    return response.data
};

export default NewOrderPickup