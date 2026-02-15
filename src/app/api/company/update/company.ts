import Company from "@/app/entities/company/company";
import RequestApi, { AddAccessToken } from "../../request";
import { Session } from "next-auth";


const UpdateCompany = async (company: Company, session: Session): Promise<string> => {
    const response = await RequestApi<Company, string>({
        path: "/company/update",
        method: "PUT",
        body: {
            ...company,
            category_ids: company.categories.map(c => c.id)
        } as Company,
        headers: AddAccessToken(session),
    });

    return response.data
};

export default UpdateCompany