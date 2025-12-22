import size from "@/app/entities/size/size";
import RequestApi, { AddAccessToken } from "../../request";
import { Session } from "next-auth";

const Newsize = async (size: size, session: Session): Promise<string> => {
    const response = await RequestApi<size, string>({
        path: "/product-category/size/new", 
        method: "POST",
        body: size,
        headers: AddAccessToken(session),
    });

    return response.data
};

export default Newsize