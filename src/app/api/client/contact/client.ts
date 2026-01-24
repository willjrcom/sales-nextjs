import Client from "@/app/entities/client/client";
import { Session } from "next-auth";
import RequestApi, { AddAccessToken } from "../../request";

const GetClientByContact = async (contact: string, session: Session): Promise<Client> => {
    const response = await RequestApi<null, Client>({
        path: "/client/by-contact/" + contact,
        method: "GET",
        headers: AddAccessToken(session),
    });
    return response.data
};

export default GetClientByContact