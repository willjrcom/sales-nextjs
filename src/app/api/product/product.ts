import Product from "@/app/entities/product/product";
import RequestApi, { AddAccessToken, GetAllResponse } from "../request";
import { Session } from "next-auth";

const GetProducts = async (session: Session, isActive: boolean = true): Promise<GetAllResponse<Product>> => {
    const response = await RequestApi<null, Product[]>({
        path: `/product/all?is_active=${isActive}`,
        method: "GET",
        headers: AddAccessToken(session),
    });

    return { items: response.data, headers: response.headers }
};

const GetComplementProducts = async (session: Session, categoryId: string): Promise<GetAllResponse<Product>> => {
    const response = await RequestApi<null, Product[]>({
        path: `/product-category/${categoryId}/complements`,
        method: "GET",
        headers: AddAccessToken(session),
    });

    return { items: response.data, headers: response.headers }
};

const GetAdditionalProducts = async (session: Session, categoryId: string): Promise<GetAllResponse<Product>> => {
    const response = await RequestApi<null, Product[]>({
        path: `/product-category/${categoryId}/additionals`,
        method: "GET",
        headers: AddAccessToken(session),
    });

    return { items: response.data, headers: response.headers }
};

export { GetAdditionalProducts, GetComplementProducts }
export default GetProducts