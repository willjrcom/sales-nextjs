import Company from "@/app/entities/company/company";
import RequestApi, { AddAccessToken } from "../../request";
import { Session } from "next-auth";


const UpdateCompany = async (company: Company, session: Session): Promise<string> => {
    const response = await RequestApi<Company, string>({
        path: "/company/update",
        method: "PUT",
        body: company,
        headers: AddAccessToken(session),
    });

    return response.data
};

export default UpdateCompany