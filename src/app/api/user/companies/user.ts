import { Session } from "next-auth";
import RequestApi, { AddIDToken, AddAccessToken, GetAllResponse } from "../../request";
import Company from "@/app/entities/company/company";

const GetUserCompanies = async (session: Session, page = 1, perPage = 10): Promise<GetAllResponse<Company>> => {
    let header = {}
    try {
        header = await AddAccessToken(session);
    } catch (error) {
        header = await AddIDToken(session);
    }

    const response = await RequestApi<null, Company[]>({
        path: `/user/companies?page=${page}&per_page=${perPage}`,
        method: "GET",
        headers: header,
    });
    
    return { items: response.data, headers: response.headers }
};

export default GetUserCompanies