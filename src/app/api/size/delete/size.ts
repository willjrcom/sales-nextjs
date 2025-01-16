import RequestApi, { AddIdToken } from "../../request";
import { Session } from "next-auth";

const DeleteSize = async (id: string, session: Session): Promise<string> => {
    const response = await RequestApi<string, string>({
        path: "/product-category/size/" + id, 
        method: "DELETE",
        headers: await AddIdToken(session),
    });

    return response.data
};

export default DeleteSize