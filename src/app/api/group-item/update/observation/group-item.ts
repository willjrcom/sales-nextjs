import GroupItem from "@/app/entities/order/group-item";
import RequestApi, { AddAccessToken } from "../../../request";
import { Session } from "next-auth";

interface ObservationGroupItemProps {
    observation?: string    
}

const ObservationGroupItem = async (groupItem: GroupItem, session: Session, observation: string): Promise<null> => {
    const response = await RequestApi<ObservationGroupItemProps, null>({
        path: "/group-item/update/observation/" + groupItem.id, 
        method: "POST",
        body: { observation } as ObservationGroupItemProps,
        headers: AddAccessToken(session),
    });

    return response.data
};

export default ObservationGroupItem