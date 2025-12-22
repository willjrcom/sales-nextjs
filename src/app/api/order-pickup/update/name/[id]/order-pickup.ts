
import RequestApi, { AddAccessToken } from "@/app/api/request";
import { Session } from "next-auth";

interface UpdateNameProps {
    name: string;
}

const UpdatePickupOrderName = async (pickupOrderId: string, name: string, session: Session): Promise<string> => {
    const body = { name: name } as UpdateNameProps;

    const response = await RequestApi<UpdateNameProps, string>({
        path: "/order-pickup/update/name/" + pickupOrderId, 
        method: "PUT",
        body: body,
        headers: AddAccessToken(session),
    });

    return response.data
};

export default UpdatePickupOrderName