import RequestApi, { AddAccessToken } from "../../request";
import { Session } from "next-auth";

const DeleteDeliveryDriver = async (id: string, session: Session): Promise<string> => {
    const response = await RequestApi<null, string>({
        path: "/delivery-driver/" + id, 
        method: "DELETE",
        headers: AddAccessToken(session),
    });

    return response.data
};

export default DeleteDeliveryDriver