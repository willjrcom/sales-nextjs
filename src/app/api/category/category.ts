import Category from "@/app/entities/category/category";
import RequestApi, { AddAccessToken, GetAllResponse } from "../request";
import { Session } from "next-auth";

const GetCategories = async (session: Session, page: number = 0, perPage: number = 1000, isActive: boolean = true): Promise<GetAllResponse<Category>> => {
    const response = await RequestApi<null, Category[]>({
        path: `/product-category/all?page=${page}&per_page=${perPage}&is_active=${isActive}`,
        method: "GET",
        headers: AddAccessToken(session),
    });
    return { items: response.data, headers: response.headers }
};

export default GetCategories