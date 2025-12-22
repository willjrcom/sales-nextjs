import GroupItem from "@/app/entities/order/group-item";
import RequestApi, { AddAccessToken } from "../../request";
import { Session } from "next-auth";

const GetGroupItemByID = async (id: string, session: Session): Promise<GroupItem> => {
    const response = await RequestApi<string, GroupItem>({
        path: "/group-item/" + id, 
        method: "GET",
        headers: AddAccessToken(session),
    });
    return response.data
};

export default GetGroupItemByID