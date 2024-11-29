import Company from "@/app/entities/company/company";
import RequestApi, { AddIdToken } from "../../request";
import { Session } from "next-auth";

const NewCompany = async (company: Company, session: Session): Promise<string> => {
    const response = await RequestApi<Company, string>({
        path: "/company/new", 
        method: "POST",
        body: company,
        headers: await AddIdToken(session),
    });

    return response.data
};

export default NewCompany