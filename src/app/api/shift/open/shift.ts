import RequestApi, { AddAccessToken } from "../../request";
import { Session } from "next-auth";

interface OpenShiftProps {
    start_change: number;
}

const OpenShift = async (startChange: number, session: Session): Promise<string> => {
    const body = { start_change: startChange } as OpenShiftProps;

    const response = await RequestApi<OpenShiftProps, string>({
        path: "/shift/open", 
        method: "POST",
        body: body,
        headers: await AddAccessToken(session),
    });

    return response.data
};

export default OpenShift