import Client from "@/app/entities/client/client";
import { Session } from "next-auth";
import RequestApi, { AddAccessToken, GetAllResponse } from "../request";

const GetClients = async (session: Session, page?: number, perPage?: number): Promise<GetAllResponse<Client>> => {
    const response = await RequestApi<null, Client[]>({
        path: `/client/all?page=${page}&per_page=${perPage}`, 
        method: "GET",
        headers: AddAccessToken(session),
    });
    return {items: response.data, headers: response.headers}
};

export default GetClients