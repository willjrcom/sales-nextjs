import RequestApi, { AddAccessToken } from "../../request";
import { Session } from "next-auth";

const DeleteTable = async (id: string, session: Session): Promise<string> => {
    const response = await RequestApi<string, string>({
        path: "/table/" + id, 
        method: "DELETE",
        headers: await AddAccessToken(session),
    });

    return response.data
};

export default DeleteTable