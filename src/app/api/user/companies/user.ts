import { Session } from "next-auth";
import RequestApi, { AddIDToken, AddAccessToken } from "../../request";
import Company from "@/app/entities/company/company";

const GetUserCompanies = async (session: Session): Promise<Company[]> => {
    let header = {}
    try {
        header = await AddAccessToken(session);
    } catch (error) {
        header = await AddIDToken(session);
    }

    const response = await RequestApi<null, Company[]>({
        path: "/user/companies",
        method: "GET",
        headers: header,
    });
    return response.data
};

export default GetUserCompanies