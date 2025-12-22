import User from "@/app/entities/user/user";
import { Session } from "next-auth";
import RequestApi, { AddAccessToken } from "../../request";

const UpdateUser = async (user: User, session: Session): Promise<string> => {
    const response = await RequestApi<User,string>({
        path: "/user/update/" + user.id, 
        method: "PATCH",
        body: user,
        headers: AddAccessToken(session),
    });
    return response.data
};

export default UpdateUser