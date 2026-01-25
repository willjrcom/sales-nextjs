import RequestApi, { AddAccessToken } from "../request";
import { CheckoutRequestDTO, CheckoutResponseDTO } from "@/entities/billing/billing";
import { Session } from "next-auth";

export const billingService = {
    checkout: async (session: Session, data: CheckoutRequestDTO) => {
        return await RequestApi<CheckoutRequestDTO, CheckoutResponseDTO>({
            path: "/company/billing/checkout",
            method: "POST",
            body: data,
            headers: AddAccessToken(session),
        });
    }
};
