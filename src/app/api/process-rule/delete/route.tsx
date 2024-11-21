import RequestApi, { AddIdToken } from "../../request";
import { Session } from "next-auth";

const DeleteProcessRule = async (id: string, session: Session): Promise<string> => {
    const response = await RequestApi<string, string>({
        path: "/product-category/process-rule/" + id, 
        method: "DELETE",
        headers: await AddIdToken(session),
    });

    return response.data
};

export default DeleteProcessRule