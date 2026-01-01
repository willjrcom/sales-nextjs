import Category from "@/app/entities/category/category";
import RequestApi, { AddAccessToken, GetAllResponse } from "../request";
import { Session } from "next-auth";

interface GetCategoriesWithIDsBody {
    ids: string[];
}

const GetCategoriesWithIDs = async (session: Session, IDs: string[]): Promise<GetAllResponse<Category>> => {
    const response = await RequestApi<GetCategoriesWithIDsBody, Category[]>({
        path: "/product-category/all",
        method: "GET",
        body: { ids: IDs },
        headers: AddAccessToken(session),
    });
    return { items: response.data, headers: response.headers }
};

export default GetCategoriesWithIDs