import { Session } from "next-auth";
import RequestApi, { AddAccessToken, GetAllResponse } from "../../request";
import Company from "@/app/entities/company/company";

const GetUserCompanies = async (session: Session, page?: number, perPage?: number): Promise<GetAllResponse<Company>> => {
    const response = await RequestApi<null, Company[]>({
        path: `/user/companies?page=${page}&per_page=${perPage}`,
        method: "GET",
        headers: AddAccessToken(session),
    });
    
    return { items: response.data, headers: response.headers }
};

export default GetUserCompanies