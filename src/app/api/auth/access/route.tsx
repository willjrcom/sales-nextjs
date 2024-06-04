import { Session } from "next-auth";
import RequestApi, { AddAccessToken } from "../../request";

interface AccessProps {
    schema: string;
}

const Access = async (credencials: AccessProps, session: Session): Promise<any> => {
    const response = await RequestApi<AccessProps, any>({
        path: "/user/access",
        method: "POST",
        body: credencials,
        headers: AddAccessToken(session),
    });
    return response.data
};

export default Access