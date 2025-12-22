import Product from "@/app/entities/product/product";
import RequestApi, { AddAccessToken } from "../../request";
import { Session } from "next-auth";

const GetProductByCode = async (code: string, session: Session): Promise<Product> => {
    const response = await RequestApi<null, Product>({
        path: "/product/code/" + code,
        method: "GET",
        headers: AddAccessToken(session),
    });
    return response.data
};

export default GetProductByCode