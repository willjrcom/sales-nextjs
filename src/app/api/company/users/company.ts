import { Session } from "next-auth";
import RequestApi, { AddAccessToken, GetAllResponse } from "../../request";
import User from "@/app/entities/user/user";

const GetUsers = async (session: Session, page?: number, perPage?: number): Promise<GetAllResponse<User>> => {
    const response = await RequestApi<null, User[]>({
        path: `/company/users?page=${page}&per_page=${perPage}`,
        method: "GET",
        headers: await AddAccessToken(session),
    });
    return { items: response.data, headers: response.headers }
};

export default GetUsers