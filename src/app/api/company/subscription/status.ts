import { SubscriptionStatus } from "@/app/entities/company/subscription";
import { Session } from "next-auth";
import RequestApi, { AddAccessToken } from "../../request";

export const GetSubscriptionStatus = async (session: Session): Promise<SubscriptionStatus> => {
    const response = await RequestApi<null, SubscriptionStatus>({
        path: "/company/subscription/status",
        method: "GET",
        headers: AddAccessToken(session),
    });
    return response.data;
};
