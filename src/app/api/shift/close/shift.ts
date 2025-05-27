import RequestApi, { AddAccessToken } from "../../request";
import { Session } from "next-auth";

interface CloseShiftProps {
    end_change: number;
}

const CloseShift = async (endChange: number, session: Session): Promise<string> => {
    const body = { end_change: endChange } as CloseShiftProps;

    const response = await RequestApi<CloseShiftProps, string>({
        path: "/shift/close", 
        method: "PUT",
        body: body,
        headers: await AddAccessToken(session),
    });

    return response.data
};

export default CloseShift