import Size from "@/app/entities/size/size";
import RequestApi, { AddAccessToken } from "../../request";
import { Session } from "next-auth";

const UpdateSize = async (size: Size, session: Session): Promise<string> => {
    const response = await RequestApi<Size, string>({
        path: "/product-category/size/update/" + size.id, 
        method: "PATCH",
        body: size,
        headers: await AddAccessToken(session),
    });

    return response.data
};

export default UpdateSize