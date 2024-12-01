import GroupItem from "@/app/entities/order/group-item";
import RequestApi, { AddIdToken } from "../../../request";
import { Session } from "next-auth";
import { start } from "repl";

interface ScheduleGroupItemProps {
    start_at?: string    
}

const ScheduleGroupItem = async (groupItem: GroupItem, startAt: Date | null | undefined, session: Session): Promise<null> => {
    let startAtString = startAt ? new Date(startAt).toISOString() : null;
    
    const response = await RequestApi<ScheduleGroupItemProps, null>({
        path: "/group-item/update/schedule/" + groupItem.id, 
        method: "POST",
        body: { start_at: startAtString } as ScheduleGroupItemProps,
        headers: await AddIdToken(session),
    });
    return response.data
};

export default ScheduleGroupItem