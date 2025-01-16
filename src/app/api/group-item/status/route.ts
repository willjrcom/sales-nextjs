import GroupItem from "@/app/entities/order/group-item";
import RequestApi, { AddIdToken } from "../../request";
import { Session } from "next-auth";

const UpdateGroupItem = async (groupItem: GroupItem, session: Session): Promise<string> => {
    const response = await RequestApi<GroupItem, string>({
        path: "/group-item/update/" + groupItem.id, 
        method: "PATCH",
        body: groupItem,
        headers: await AddIdToken(session),
    });

    return response.data
};

export default UpdateGroupItem