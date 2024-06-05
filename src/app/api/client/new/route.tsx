import { Client } from "@/app/entities/client/client";
import { Session } from "next-auth";
import RequestApi, { AddIdToken } from "../../request";

const NewClient = async (client: Client, session: Session): Promise<string> => {
    if (session.idToken === undefined) {
        throw new Error("idToken not found in session");
    }

    const response = await RequestApi<Client,string>({
        path: "/client/new", 
        method: "POST",
        body: client,
        headers: await AddIdToken(session),
    });
    return response.data
};

export default NewClient