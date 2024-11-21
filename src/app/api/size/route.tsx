import Size from "@/app/entities/size/size";
import RequestApi, { AddIdToken } from "../request";
import { Session } from "next-auth";

const GetSizes = async (session: Session): Promise<Size[]> => {
    const response = await RequestApi<null, Size[]>({
        path: "/product-category/size/all", 
        method: "GET",
        headers: await AddIdToken(session),
    });

    return response.data
};

export default GetSizes