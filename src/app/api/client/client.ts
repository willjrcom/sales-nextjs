import Client from "@/app/entities/client/client";
import { Session } from "next-auth";
import RequestApi, { AddAccessToken } from "../request";

const GetClients = async (session: Session): Promise<Client[]> => {
    const response = await RequestApi<null, Client[]>({
        path: "/client/all", 
        method: "GET",
        headers: await AddAccessToken(session),
    });
    return response.data
};

export default GetClients