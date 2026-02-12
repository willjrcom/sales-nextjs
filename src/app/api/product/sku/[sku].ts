import Product from "@/app/entities/product/product";
import RequestApi, { AddAccessToken } from "../../request";
import { Session } from "next-auth";

const GetProductBySKU = async (sku: string, session: Session): Promise<Product> => {
    const response = await RequestApi<null, Product>({
        path: "/product/sku/" + sku,
        method: "GET",
        headers: AddAccessToken(session),
    });
    return response.data
};

export default GetProductBySKU