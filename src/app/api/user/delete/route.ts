import { Session } from "next-auth";
import RequestApi, { AddIdToken } from "../../request";

interface DeleteUserProps {
    email: string;
    password: string;
}

const DeleteUser = async (body: DeleteUserProps, session: Session): Promise<string> => {
    const response = await RequestApi<DeleteUserProps, string>({
        path: "/user", 
        method: "DELETE",
        body: body,
        headers: await AddIdToken(session),
    });
    return response.data
};

export default DeleteUser