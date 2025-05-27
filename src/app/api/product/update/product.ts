import Product from "@/app/entities/product/product";
import RequestApi, { AddAccessToken } from "../../request";
import { Session } from "next-auth";

const UpdateProduct = async (product: Product, session: Session): Promise<string> => {
    const response = await RequestApi<Product, string>({
        path: "/product/update/" + product.id, 
        method: "PATCH",
        body: product,
        headers: await AddAccessToken(session),
    });

    return response.data
};

export default UpdateProduct