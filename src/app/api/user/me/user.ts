import User from "@/app/entities/user/user";
import { Session } from "next-auth";
import RequestApi, { AddIDToken, AddAccessToken } from "../../request";

const GetUser = async (session: Session): Promise<User> => {
    let header = {}
    try {
        header = await AddAccessToken(session);
    } catch (error) {
        header = await AddIDToken(session);
    }

    const response = await RequestApi<null, User>({
        path: `/user/me`,
        method: "GET",
        headers: header,
    });
    
    return response.data
};

export default GetUser