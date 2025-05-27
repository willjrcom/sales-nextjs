import RequestApi, { AddAccessToken } from "../../request";
import { Session } from "next-auth";

interface RemoveUserToCompanyProps {
    email: string
}

const RemoveUserFromCompany = async (email: string, session: Session): Promise<string> => {
    const body = {email: email} as RemoveUserToCompanyProps
    const response = await RequestApi<RemoveUserToCompanyProps, string>({
        path: "/company/remove/user", 
        method: "POST",
        body: body,
        headers: await AddAccessToken(session),
    });

    return response.data
};

export default RemoveUserFromCompany