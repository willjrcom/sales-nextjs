import Category from "@/app/entities/category/category";
import RequestApi, { AddAccessToken } from "../../../request";
import { Session } from "next-auth";

const GetCategoriesWithOrderProcess = async (session: Session): Promise<Category[]> => {
    const response = await RequestApi<null, Category[]>({
        path: "/product-category/all-with-order-process", 
        method: "GET",
        headers: AddAccessToken(session),
    });
    return response.data
};

export default GetCategoriesWithOrderProcess