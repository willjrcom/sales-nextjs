import RequestApi, { AddIdToken } from "../../request";
import { Session } from "next-auth";

const DeleteItem = async (id: string, session: Session): Promise<string> => {
    const response = await RequestApi<string, string>({
        path: "/item/" + id, 
        method: "DELETE",
        headers: await AddIdToken(session),
    });

    return response.data
};

export default DeleteItem