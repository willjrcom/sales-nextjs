import { Session } from "next-auth";
import RequestApi, { AddAccessToken } from "../request";
import User from "@/app/entities/user/user";

/**
 * Fetches the list of users from the public metadata API.
 * Requires ID token authentication.
 */
const ListPublicUsers = async (session: Session): Promise<User[]> => {
  const response = await RequestApi<null, User[]>({
    path: "/public/users",
    method: "GET",
    headers: AddAccessToken(session),
  });

  return response.data;
};

export default ListPublicUsers;
