import RequestApi, { AddIdToken } from "../../request";
import { Session } from "next-auth";

const DeleteOrder = async (id: string, session: Session): Promise<string> => {
    const response = await RequestApi<string, string>({
        path: "/order/" + id, 
        method: "DELETE",
        headers: await AddIdToken(session),
    });

    return response.data
};

export default DeleteOrder