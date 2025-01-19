import Company from "@/app/entities/company/company";
import RequestApi, { AddIdToken } from "../../request";

interface NewCompanyResponseProps {
    company_id: string;
    schema: string;
}

const NewCompany = async (company: Company): Promise<NewCompanyResponseProps> => {
    const response = await RequestApi<Company, NewCompanyResponseProps>({
        path: "/company/new", 
        method: "POST",
        body: company,
    });

    return response.data
};

export default NewCompany