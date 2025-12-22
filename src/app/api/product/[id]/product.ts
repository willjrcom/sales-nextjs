import Product from "@/app/entities/product/product";
import RequestApi, { AddAccessToken } from "../../request";
import { Session } from "next-auth";

const GetProductByID = async (id: string, session: Session): Promise<Product> => {
    const response = await RequestApi<null, Product>({
        path: "/product/" + id,
        method: "GET",
        headers: AddAccessToken(session),
    });
    return response.data
};

export default GetProductByID