import { Session } from "next-auth";
import RequestApi from "../../request";

interface AccessProps {
    schema: string;
}

const Access = async (credencials: AccessProps, session: Session): Promise<any> => {
    const response = await RequestApi<AccessProps, any>(
        {
            path: "/user/access",
            method: "POST",
            body: credencials,
            headers: {
                "access-token": session.accessToken
            }
        });
    return response
};

export default Access