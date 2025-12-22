import RequestApi, { AddAccessToken } from "@/app/api/request";
import { Session } from "next-auth";

interface UpdateChangeOrderDeliveryProps {
    change: number;
    payment_method: string;
}
const UpdateChangeOrderDelivery = async (delivery_id: string, change: number, payment_method: string, session: Session): Promise<string> => {
    const body = {change, payment_method} as UpdateChangeOrderDeliveryProps;

    const response = await RequestApi<UpdateChangeOrderDeliveryProps, string>({
        path: "/order-delivery/update/change/" + delivery_id, 
        method: "PUT",
        body: body,
        headers: AddAccessToken(session),
    });

    return response.data
};

export default UpdateChangeOrderDelivery