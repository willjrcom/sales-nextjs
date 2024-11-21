import Client from "@/app/entities/client/client";
import { Session } from "next-auth";
import RequestApi, { AddIdToken } from "../../request";

const DeleteClient = async (id: string, session: Session): Promise<string> => {
    const response = await RequestApi<string, string>({
        path: "/client/" + id, 
        method: "DELETE",
        headers: await AddIdToken(session),
    });
    return response.data
};

export default DeleteClient