import { Session } from "next-auth";
import RequestApi, { AddIdToken } from "../../request";
import User from "@/app/entities/user/user";

const NewUser = async (user: User, session: Session): Promise<string> => {
    const response = await RequestApi<User,string>({
        path: "/user/new", 
        method: "POST",
        body: user,
        headers: await AddIdToken(session),
    });
    return response.data
};

export default NewUser