import GroupItem from "@/app/entities/order/group-item";
import RequestApi, { AddAccessToken } from "../request";
import { Session } from "next-auth";

const GetGroupItems = async (session: Session): Promise<GroupItem[]> => {
    const response = await RequestApi<null, GroupItem[]>({
        path: "/group-item/all", 
        method: "GET",
        headers: AddAccessToken(session),
    });
    return response.data
};

export default GetGroupItems