import GroupItem from "@/app/entities/order/group-item";
import RequestApi, { AddIdToken } from "../request";
import { Session } from "next-auth";

const GetGroupItems = async (session: Session): Promise<GroupItem[]> => {
    const response = await RequestApi<null, GroupItem[]>({
        path: "/group-item/all", 
        method: "GET",
        headers: await AddIdToken(session),
    });
    return response.data
};

export default GetGroupItems