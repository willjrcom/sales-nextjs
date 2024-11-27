import RequestApi, { AddIdToken } from "../../request";
import { Session } from "next-auth";

const DeleteGroupItem = async (id: string, session: Session): Promise<string> => {
    const response = await RequestApi<string, string>({
        path: "/group-item/" + id, 
        method: "DELETE",
        headers: await AddIdToken(session),
    });

    return response.data
};

export default DeleteGroupItem