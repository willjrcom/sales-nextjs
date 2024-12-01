import RequestApi, { AddIdToken } from "@/app/api/request";
import { Session } from "next-auth";

const UpdateAddressOrderDelivery = async (delivery_id: string, session: Session): Promise<string> => {
    const response = await RequestApi<null, string>({
        path: "/order-delivery/update/address/" + delivery_id, 
        method: "PUT",
        headers: await AddIdToken(session),
    });

    return response.data
};

export default UpdateAddressOrderDelivery