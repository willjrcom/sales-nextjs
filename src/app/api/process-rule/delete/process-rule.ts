import RequestApi, { AddAccessToken } from "../../request";
import { Session } from "next-auth";

const DeleteProcessRule = async (id: string, session: Session): Promise<string> => {
    const response = await RequestApi<string, string>({
        path: "/product-category/process-rule/" + id, 
        method: "DELETE",
        headers: await AddAccessToken(session),
    });

    return response.data
};

export default DeleteProcessRule