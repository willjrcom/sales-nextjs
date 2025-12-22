import { Session } from "next-auth";
import Company from "@/app/entities/company/company";
import RequestApi, { AddAccessToken } from "../request";

/**
 * Fetches the list of companies exposed by the public metadata API.
 * Requires the caller to send the current ID token.
 */
const ListPublicCompanies = async (session: Session): Promise<Company[]> => {
  const response = await RequestApi<null, Company[]>({
    path: "/public/companies",
    method: "GET",
    headers: AddAccessToken(session),
  });

  return response.data;
};

export default ListPublicCompanies;
