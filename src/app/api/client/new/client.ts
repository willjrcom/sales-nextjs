import Client from "@/app/entities/client/client";
import { Session } from "next-auth";
import RequestApi, { AddAccessToken } from "../../request";

const NewClient = async (client: Client, session: Session): Promise<string> => {
    const response = await RequestApi<Client,string>({
        path: "/client/new", 
        method: "POST",
        body: client,
        headers: AddAccessToken(session),
    });
    return response.data
};

export default NewClient