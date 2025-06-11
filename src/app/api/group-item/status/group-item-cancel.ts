import GroupItem from "@/app/entities/order/group-item";
import RequestApi, { AddAccessToken } from "../../request";
import { Session } from "next-auth";

const CancelGroupItem = async (groupItem: GroupItem, session: Session): Promise<string> => {
    const response = await RequestApi<GroupItem, string>({
        path: "/group-item/cancel/" + groupItem.id, 
        method: "POST",
        body: groupItem,
        headers: await AddAccessToken(session),
    });

    return response.data
};

export default CancelGroupItem