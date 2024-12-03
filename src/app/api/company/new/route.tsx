import Company from "@/app/entities/company/company";
import RequestApi, { AddIdToken } from "../../request";
import { Session } from "next-auth";

interface NewCompanyResponseProps {
    company_id: string;
    schema: string;
}

const NewCompany = async (company: Company, session: Session): Promise<NewCompanyResponseProps> => {
    const response = await RequestApi<Company, NewCompanyResponseProps>({
        path: "/company/new", 
        method: "POST",
        body: company,
        headers: await AddIdToken(session),
    });

    return response.data
};

export default NewCompany