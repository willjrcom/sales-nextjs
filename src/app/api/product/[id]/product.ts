import Product from "@/app/entities/product/product";
import RequestApi, { AddIdToken } from "../../request";
import { Session } from "next-auth";

const GetProductByID = async (id: string, session: Session): Promise<Product> => {
    const response = await RequestApi<null, Product>({
        path: "/product/" + id,
        method: "GET",
        headers: await AddIdToken(session),
    });
    return response.data
};

export default GetProductByID