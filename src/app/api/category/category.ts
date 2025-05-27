import Category from "@/app/entities/category/category";
import RequestApi, { AddAccessToken } from "../request";
import { Session } from "next-auth";

const GetCategories = async (session: Session): Promise<Category[]> => {
    const response = await RequestApi<null, Category[]>({
        path: "/product-category/all", 
        method: "GET",
        headers: await AddAccessToken(session),
    });
    return response.data
};

export default GetCategories