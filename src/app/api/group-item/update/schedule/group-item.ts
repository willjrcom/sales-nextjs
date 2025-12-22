import GroupItem from "@/app/entities/order/group-item";
import RequestApi, { AddAccessToken } from "../../../request";
import { Session } from "next-auth";
import { ToIsoDate } from "@/app/utils/date";

interface ScheduleGroupItemProps {
    start_at?: string    
}

const ScheduleGroupItem = async (groupItem: GroupItem, session: Session, startAt?: string | null): Promise<null> => {
    const startAtString = startAt ? ToIsoDate(startAt) : null;
    
    const response = await RequestApi<ScheduleGroupItemProps, null>({
        path: "/group-item/update/schedule/" + groupItem.id, 
        method: "POST",
        body: { start_at: startAtString } as ScheduleGroupItemProps,
        headers: AddAccessToken(session),
    });
    return response.data
};

export default ScheduleGroupItem