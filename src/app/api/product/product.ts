import Product from "@/app/entities/product/product";
import RequestApi, { AddAccessToken, GetAllResponse } from "../request";
import { Session } from "next-auth";

const GetProducts = async (session: Session, page: number = 0, pageSize: number = 10, isActive: boolean = true): Promise<GetAllResponse<Product>> => {
    const response = await RequestApi<null, Product[]>({
        path: `/product/all?page=${page}&per_page=${pageSize}&is_active=${isActive}`,
        method: "GET",
        headers: AddAccessToken(session),
    });

    return { items: response.data, headers: response.headers }
};

const GetDefaultProducts = async (session: Session, page: number = 0, pageSize: number = 10, isActive: boolean = true): Promise<GetAllResponse<Product>> => {
    const response = await RequestApi<null, Product[]>({
        path: `/product/all/default?page=${page}&per_page=${pageSize}&is_active=${isActive}`,
        method: "GET",
        headers: AddAccessToken(session),
    });

    return { items: response.data, headers: response.headers }
};

const GetDefaultProductsByCategory = async (session: Session, categoryId: string, isMap: boolean = false): Promise<Product[]> => {
    const response = await RequestApi<null, Product[]>({
        path: `/product-category/${categoryId}/default-products?is_map=${isMap}`,
        method: "GET",
        headers: AddAccessToken(session),
    });

    return response.data
};

const GetComplementProducts = async (session: Session, categoryId: string): Promise<GetAllResponse<Product>> => {
    const response = await RequestApi<null, Product[]>({
        path: `/product-category/${categoryId}/complement-products`,
        method: "GET",
        headers: AddAccessToken(session),
    });

    return { items: response.data, headers: response.headers }
};

const GetAdditionalProducts = async (session: Session, categoryId: string): Promise<GetAllResponse<Product>> => {
    const response = await RequestApi<null, Product[]>({
        path: `/product-category/${categoryId}/additional-products`,
        method: "GET",
        headers: AddAccessToken(session),
    });

    return { items: response.data, headers: response.headers }
};

const GetProductsMap = async (session: Session, categoryID?: string): Promise<Product[]> => {
    let optionalParams = '';
    if (categoryID) optionalParams = `?category_id=${categoryID}`;

    const response = await RequestApi<null, Product[]>({
        path: `/product/all-map${optionalParams}`,
        method: "GET",
        headers: AddAccessToken(session),
    });

    return response.data
};

export { GetDefaultProducts, GetDefaultProductsByCategory, GetAdditionalProducts, GetComplementProducts, GetProductsMap }
export default GetProducts