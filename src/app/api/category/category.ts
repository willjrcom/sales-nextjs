import Category, { CategoryMap } from "@/app/entities/category/category";
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

export const GetCategoriesMap = async (session: Session, isActive: boolean = true): Promise<CategoryMap[]> => {
    const response = await RequestApi<null, CategoryMap[]>({
        path: `/product-category/all?is_active=${isActive}`,
        method: "GET",
        headers: AddAccessToken(session),
    });
    return response.data;
};

export const GetCategoriesAdditional = async (session: Session, isActive: boolean = true): Promise<Category[]> => {
    const response = await RequestApi<null, Category[]>({
        path: `/product-category/all/additionals`,
        method: "GET",
        headers: AddAccessToken(session),
    });
    return response.data
};

export const GetCategoriesComplement = async (session: Session, isActive: boolean = true): Promise<Category[]> => {
    const response = await RequestApi<null, Category[]>({
        path: `/product-category/all/complements`,
        method: "GET",
        headers: AddAccessToken(session),
    });
    return response.data
};

export default GetCategories