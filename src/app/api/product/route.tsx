import Product from "@/app/entities/product/product";
import RequestApi, { AddIdToken } from "../request";
import { Session } from "next-auth";

const GetProducts = async (session: Session): Promise<Product[]> => {
    const response = await RequestApi<null, Product[]>({
        path: "/product/all", 
        method: "GET",
        headers: AddIdToken(session),
    });

    return response.data
};

export default GetProducts