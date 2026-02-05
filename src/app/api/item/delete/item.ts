import RequestApi, { AddAccessToken } from "../../request";
import { Session } from "next-auth";

const DeleteItem = async (id: string, session: Session): Promise<boolean> => {
    const response = await RequestApi<string, boolean>({
        path: "/item/" + id,
        method: "DELETE",
        headers: AddAccessToken(session),
    });

    return response.data
};

export default DeleteItem