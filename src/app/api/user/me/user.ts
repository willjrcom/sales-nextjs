import User from "@/app/entities/user/user";
import { Session } from "next-auth";
import RequestApi, { AddAccessToken } from "../../request";

const GetUser = async (session: Session): Promise<User> => {
    const response = await RequestApi<null, User>({
        path: `/user/me`,
        method: "GET",
        headers: AddAccessToken(session),
    });
    
    return response.data
};

export default GetUser