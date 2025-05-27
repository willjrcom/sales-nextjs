import Category from "@/app/entities/category/category";
import RequestApi, { AddAccessToken } from "../../request";
import { Session } from "next-auth";

const UpdateCategory = async (category: Category, session: Session): Promise<string> => {
    const response = await RequestApi<Category, string>({
        path: "/product-category/update/" + category.id, 
        method: "PATCH",
        body: category,
        headers: await AddAccessToken(session),
    });

    return response.data
};

export default UpdateCategory