import Category from "@/app/entities/category/category";
import RequestApi, { AddAccessToken, GetAllResponse } from "../request";
import { Session } from "next-auth";

const GetCategories = async (session: Session): Promise<GetAllResponse<Category>> => {
    const response = await RequestApi<null, Category[]>({
        path: "/product-category/all",
        method: "GET",
        headers: AddAccessToken(session),
    });
    return { items: response.data, headers: response.headers }
};

export default GetCategories