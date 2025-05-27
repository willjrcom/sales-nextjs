import Client from "@/app/entities/client/client";
import { Session } from "next-auth";
import RequestApi, { AddAccessToken } from "../../request";

const UpdateClient = async (client: Client, session: Session): Promise<string> => {
    const response = await RequestApi<Client,string>({
        path: "/client/update/" + client.id, 
        method: "PATCH",
        body: client,
        headers: await AddAccessToken(session),
    });
    return response.data
};

export default UpdateClient