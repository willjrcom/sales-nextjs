import Category from "@/app/entities/category/category";
import RequestApi, { AddIdToken } from "../../request";
import { Session } from "next-auth";

const GetCategoryByID = async (id: string, session: Session): Promise<Category> => {
    const response = await RequestApi<string, Category>({
        path: "/product-category/" + id, 
        method: "GET",
        headers: await AddIdToken(session),
    });
    return response.data
};

export default GetCategoryByID