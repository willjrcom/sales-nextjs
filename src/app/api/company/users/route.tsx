import { Session } from "next-auth";
import RequestApi, { AddIdToken } from "../../request";
import User from "@/app/entities/user/user";

const GetUsers = async (session: Session): Promise<User[]> => {
    const response = await RequestApi<null, User[]>({
        path: "/company/users",
        method: "GET",
        headers: await AddIdToken(session),
    });
    return response.data
};

export default GetUsers