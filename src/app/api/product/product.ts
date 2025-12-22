import Product from "@/app/entities/product/product";
import RequestApi, { AddAccessToken } from "../request";
import { Session } from "next-auth";

const GetProducts = async (session: Session): Promise<Product[]> => {
    const response = await RequestApi<null, Product[]>({
        path: "/product/all", 
        method: "GET",
        headers: AddAccessToken(session),
    });

    return response.data
};

export default GetProducts