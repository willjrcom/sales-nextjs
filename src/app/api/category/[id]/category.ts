import Category from "@/app/entities/category/category";
import RequestApi, { AddAccessToken } from "../../request";
import { Session } from "next-auth";

const GetCategoryByID = async (id: string, session: Session): Promise<Category> => {
    const response = await RequestApi<string, Category>({
        path: "/product-category/" + id, 
        method: "GET",
        headers: AddAccessToken(session),
    });
    return response.data
};

export default GetCategoryByID