import RequestApi, { AddAccessToken } from "../../request";
import { Session } from "next-auth";

interface AddUserToCompanyProps {
    email: string
}

const AddUserToCompany = async (email: string, session: Session): Promise<string> => {
    const body = {email: email} as AddUserToCompanyProps
    const response = await RequestApi<AddUserToCompanyProps, string>({
        path: "/company/add/user", 
        method: "POST",
        body: body,
        headers: AddAccessToken(session),
    });

    return response.data
};

export default AddUserToCompany