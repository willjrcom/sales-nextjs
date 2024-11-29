import Category from "@/app/entities/company/company";
import RequestApi, { AddIdToken } from "../../request";
import { Session } from "next-auth";

interface RemoveUserToCompanyProps {
    email: string
}

const RemoveUserToCompany = async (email: string, session: Session): Promise<string> => {
    const body = {email: email} as RemoveUserToCompanyProps
    const response = await RequestApi<RemoveUserToCompanyProps, string>({
        path: "/company/remove/user", 
        method: "POST",
        body: body,
        headers: await AddIdToken(session),
    });

    return response.data
};

export default RemoveUserToCompany