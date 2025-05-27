import { Session } from "next-auth";
import RequestApi, { AddIDToken } from "../../request";

interface AccessProps {
    schema: string;
}

const Access = async (credencials: AccessProps, session: Session): Promise<string> => {
    const response = await RequestApi<AccessProps, string>({
        path: "/user/access",
        method: "POST",
        body: credencials,
        headers: await AddIDToken(session),
    });
    return response.data
};

export default Access