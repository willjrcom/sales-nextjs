import { Session } from "next-auth";
import RequestApi, { AddAccessToken } from "../request";
import Size from "@/app/entities/size/size";

const GetSizesByCategoryID = async (session: Session, categoryID: string): Promise<Size[]> => {
    const response = await RequestApi<null, Size[]>({
        path: `/product-category/size/by-category-id/${categoryID}`,
        method: "GET",
        headers: AddAccessToken(session),
    });
    return response.data
};

export default GetSizesByCategoryID