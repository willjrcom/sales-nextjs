import Company from "@/app/entities/company/company";
import RequestApi, { AddIdToken } from "../../request";
import { Session } from "next-auth";

const GetCompanyByID = async (id: string, session: Session): Promise<Company> => {
    const response = await RequestApi<string, Company>({
        path: "/company/" + id, 
        method: "GET",
        headers: await AddIdToken(session),
    });
    return response.data
};

export default GetCompanyByID