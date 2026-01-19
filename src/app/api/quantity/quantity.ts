import { Session } from "next-auth";
import RequestApi, { AddAccessToken } from "../request";
import Quantity from "@/app/entities/quantity/quantity";

const GetQuantitiesByCategoryID = async (session: Session, categoryID: string): Promise<Quantity[]> => {
    const response = await RequestApi<null, Quantity[]>({
        path: `/product-category/quantity/by-category-id/${categoryID}`,
        method: "GET",
        headers: AddAccessToken(session),
    });
    return response.data
};

export default GetQuantitiesByCategoryID