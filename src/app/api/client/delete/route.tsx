import Client from "@/app/entities/client/client";
import { Session } from "next-auth";
import RequestApi, { AddIdToken } from "../../request";

const DeleteClient = async (client: Client, session: Session): Promise<string> => {
    const response = await RequestApi<Client,string>({
        path: "/client/" + client.id, 
        method: "DELETE",
        headers: await AddIdToken(session),
    });
    return response.data
};

export default DeleteClient