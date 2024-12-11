import RequestApi, { AddIdToken } from "../../request";
import { Session } from "next-auth";
import DeliveryDriver from "@/app/entities/delivery-driver/delivery-driver";

const UpdateDeliveryDriver = async (order: DeliveryDriver, session: Session): Promise<string> => {
    const response = await RequestApi<DeliveryDriver, string>({
        path: "/delivery-driver/update/" + order.id, 
        method: "PATCH",
        body: order,
        headers: await AddIdToken(session),
    });

    return response.data
};

export default UpdateDeliveryDriver