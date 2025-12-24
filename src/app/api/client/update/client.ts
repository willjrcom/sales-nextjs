import Client, { ClientFormData } from "@/app/entities/client/client";
import { Session } from "next-auth";
import RequestApi, { AddAccessToken } from "../../request";

const UpdateClient = async (client: ClientFormData, session: Session): Promise<string> => {
    const response = await RequestApi<ClientFormData,string>({
        path: "/client/update/" + client.id, 
        method: "PATCH",
        body: client,
        headers: AddAccessToken(session),
    });
    return response.data
};

export default UpdateClient