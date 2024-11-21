import Product from "@/app/entities/product/product";
import RequestApi, { AddIdToken } from "../../request";
import { Session } from "next-auth";

const DeleteProduct = async (id: string, session: Session): Promise<string> => {
    const response = await RequestApi<string, string>({
        path: "/product/" + id, 
        method: "DELETE",
        headers: await AddIdToken(session),
    });

    return response.data
};

export default DeleteProduct