import RequestApi, { AddAccessToken } from "../request";
import { Session } from "next-auth";

export interface CheckoutRequestDTO {
    company_id: string;
    cost_ids?: string[];
    plan?: string;        // "BASIC", "INTERMEDIATE", "ENTERPRISE"
    periodicity?: string; // "MONTHLY", "SEMIANNUAL", "ANNUAL"
}

export interface CreateCostDTO {
    company_id: string;
    cost_type: string;
    description: string;
    amount: string;
}

export interface CheckoutResponseDTO {
    payment_id: string; // Updated from usage_cost_id
    checkout_url: string;
}

export interface CompanyPayment {
    id: string;
    status: string;
    amount: string;
    created_at: string;
    paid_at?: string;
    months: number;
    provider_payment_id: string;
    payment_url: string;
    external_reference: string;
}

export interface UsageCost {
    id: string;
    company_id: string;
    cost_type: string;
    description: string;
    amount: string;
    status: string;
    created_at: string;
    reference_id?: string;
    payment_id?: string;
}

export interface MonthlyCostSummary {
    company_id: string;
    month: number;
    year: number;
    total_amount: string;
    total_paid: string;
    costs_by_type: Record<string, string>;
    costs_count: number;
    other_fee: string;
    nfce_costs: string;
    nfce_count: number;
    current_page: number;
    per_page: number;
    total_items: number;
    items: UsageCost[];
}

export const createCheckout = async (session: Session, data: CheckoutRequestDTO) => {
    return await RequestApi<CheckoutRequestDTO, CheckoutResponseDTO>({
        path: "/company/checkout/subscription",
        method: "POST",
        body: data,
        headers: AddAccessToken(session),
    });
}


export const createCost = async (session: Session, data: CreateCostDTO) => {
    return await RequestApi<CreateCostDTO, null>({
        path: "/company/costs/register",
        method: "POST",
        body: data,
        headers: AddAccessToken(session),
    });
}

export const createCostCheckout = async (session: Session) => {
    return await RequestApi<null, CheckoutResponseDTO>({
        path: "/company/checkout/costs",
        method: "POST",
        headers: AddAccessToken(session),
    });
}

export const listPayments = async (session: Session, page = 0, perPage = 10) => {
    return await RequestApi<null, CompanyPayment[]>({
        path: `/company/payments?page=${page}&per_page=${perPage}`,
        method: "GET",
        headers: AddAccessToken(session),
    });
}

export const getMonthlyCosts = async (session: Session, month: number, year: number, page = 1) => {
    return await RequestApi<null, MonthlyCostSummary>({
        path: `/company/costs/monthly?month=${month}&year=${year}&page=${page}`,
        method: "GET",
        headers: AddAccessToken(session),
    });
}

export const cancelPayment = async (session: Session, paymentId: string) => {
    return await RequestApi<null, null>({
        path: `/company/checkout/cancel/${paymentId}`,
        method: "POST",
        headers: AddAccessToken(session),
    });
}
