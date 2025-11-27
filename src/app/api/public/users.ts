import { Session } from "next-auth";
import RequestApi, { AddIDToken } from "../request";
import User from "@/app/entities/user/user";

/**
 * Fetches the list of users from the public metadata API.
 * Requires ID token authentication.
 */
const ListPublicUsers = async (session: Session): Promise<User[]> => {
  const response = await RequestApi<null, User[]>({
    path: "/public/users",
    method: "GET",
    headers: await AddIDToken(session),
  });

  return response.data;
};

export default ListPublicUsers;
