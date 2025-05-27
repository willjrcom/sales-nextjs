import { Session } from "next-auth";
import RequestApi, { AddAccessToken } from "../../../request";

interface UpdateUserProps {
    email: string;
    password: string;
}

const UpdateUserPassword = async (body: UpdateUserProps, session: Session): Promise<string> => {
    const response = await RequestApi<UpdateUserProps,string>({
        path: "/user/update/password", 
        method: "POST",
        body: body,
        headers: await AddAccessToken(session),
    });
    return response.data
};

export default UpdateUserPassword