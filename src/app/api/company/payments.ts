import { Session } from "next-auth";
import Decimal from "decimal.js";
import RequestApi, { AddAccessToken } from "../request";
import CompanyPayment from "@/app/entities/company/company-payment";
import SubscriptionSettings from "@/app/entities/company/subscription-settings";

interface CompanyPaymentResponse {
    id: string;
    provider: string;
    provider_payment_id: string;
    status: string;
    currency: string;
    amount: string;
    months: number;
    paid_at: string;
    external_reference?: string;
}

export interface SubscriptionCheckoutResponse {
    preference_id: string;
    init_point: string;
    sandbox_init_point?: string;
}

interface SubscriptionCheckoutDTO {
    months: number;
}

export async function listCompanyPayments(
    session: Session,
    pageIndex = 0,
    pageSize = 10,
) {
    const response = await RequestApi<null, CompanyPaymentResponse[]>({
        path: `/company/payments?page=${pageIndex + 1}&per_page=${pageSize}`,
        method: "GET",
        headers: AddAccessToken(session),
    });

    const items = response.data.map(
        (payment) =>
            new CompanyPayment({
                ...payment,
                amount: new Decimal(payment.amount),
            }),
    );
    const totalHeader = response.headers.get("X-Total-Count");
    const totalCount = totalHeader ? parseInt(totalHeader, 10) : items.length;

    return { items, totalCount };
}

export async function createSubscriptionCheckout(
    session: Session,
    months: number,
) {
    const response = await RequestApi<
        SubscriptionCheckoutDTO,
        SubscriptionCheckoutResponse
    >({
        path: "/company/payments/mercadopago/checkout",
        method: "POST",
        body: { months },
        headers: AddAccessToken(session),
    });

    return response.data;
}

export async function getSubscriptionSettings(session: Session) {
    const response = await RequestApi<null, SubscriptionSettings>({
        path: "/company/payments/mercadopago/settings",
        method: "GET",
        headers: AddAccessToken(session),
    });

    return new SubscriptionSettings(response.data);
}
