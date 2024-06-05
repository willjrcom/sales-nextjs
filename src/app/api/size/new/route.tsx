import Size from "@/app/entities/size/size";
import RequestApi, { AddIdToken } from "../../request";
import { Session } from "next-auth";

const NewSize = async (size: Size, session: Session): Promise<string> => {
    const response = await RequestApi<Size, string>({
        path: "/size/new", 
        method: "POST",
        body: size,
        headers: await AddIdToken(session),
    });

    return response.data
};

export default NewSize