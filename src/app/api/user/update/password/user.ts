import RequestApi, { AddAccessToken } from "../../../request";
import { Session } from "next-auth";

interface UpdateUserProps {
    email: string;
    current_password: string;
    new_password: string;
}

const UpdateUserPassword = async (body: UpdateUserProps, session: Session): Promise<string> => {
    const response = await RequestApi<UpdateUserProps, string>({
        path: "/user/update/password",
        method: "PATCH",
        body: body,
        headers: AddAccessToken(session),
    });
    return response.data
};

export default UpdateUserPassword