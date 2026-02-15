import Company from "@/app/entities/company/company";
import RequestApi, { AddAccessToken } from "../../request";
import { Session } from "next-auth";

interface NewCompanyResponseProps {
    company_id: string;
    schema: string;
}

const NewCompany = async (company: Company, session: Session): Promise<NewCompanyResponseProps> => {
    const response = await RequestApi<Company, NewCompanyResponseProps>({
        path: "/company/new",
        method: "POST",
        body: {
            ...company,
            category_ids: company.categories.map(c => c.id)
        } as Company,
        headers: AddAccessToken(session),
    });

    return response.data
};

export default NewCompany