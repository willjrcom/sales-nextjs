import Client from "@/app/entities/client/client";
import { Session } from "next-auth";
import RequestApi, { AddAccessToken } from "../../request";

const DeleteClient = async (id: string, session: Session): Promise<string> => {
    const response = await RequestApi<string, string>({
        path: "/client/" + id, 
        method: "DELETE",
        headers: AddAccessToken(session),
    });
    return response.data
};

export default DeleteClient