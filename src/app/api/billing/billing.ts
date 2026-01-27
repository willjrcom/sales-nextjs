import RequestApi, { AddAccessToken, GetAllResponse } from "../request";
import { Session } from "next-auth";
import { CompanyPayment } from "@/app/entities/company/company-payment";
import { CompanyUsageCost } from "@/app/entities/company/company-usage-cost";

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
    items: CompanyUsageCost[];
}

export const createCheckout = async (session: Session, data: CheckoutRequestDTO) => {
    const response = await RequestApi<CheckoutRequestDTO, CheckoutResponseDTO>({
        path: "/company/checkout/subscription",
        method: "POST",
        body: data,
        headers: AddAccessToken(session),
    });

    return response.data;
}


export const createCost = async (session: Session, data: CreateCostDTO) => {
    const response = await RequestApi<CreateCostDTO, null>({
        path: "/company/costs/register",
        method: "POST",
        body: data,
        headers: AddAccessToken(session),
    });

    return response.data;
}

export const createCostCheckout = async (session: Session) => {
    const response = await RequestApi<null, CheckoutResponseDTO>({
        path: "/company/checkout/costs",
        method: "POST",
        headers: AddAccessToken(session),
    });

    return response.data;
}

export const listPayments = async (session: Session, page = 0, perPage = 10): Promise<GetAllResponse<CompanyPayment>> => {
    const response = await RequestApi<null, CompanyPayment[]>({
        path: `/company/payments?page=${page}&per_page=${perPage}`,
        method: "GET",
        headers: AddAccessToken(session),
    });

    const totalCount = response.headers.get("X-Total-Count");
    return {
        items: response.data,
        headers: response.headers,
        totalCount: totalCount ? parseInt(totalCount) : 0,
    }
}

export const getMonthlyCosts = async (session: Session, month: number, year: number, page = 1): Promise<MonthlyCostSummary> => {
    const response = await RequestApi<null, MonthlyCostSummary>({
        path: `/company/costs/monthly?month=${month}&year=${year}&page=${page}`,
        method: "GET",
        headers: AddAccessToken(session),
    });

    return response.data;
}

export const cancelPayment = async (session: Session, paymentId: string) => {
    const response = await RequestApi<null, null>({
        path: `/company/checkout/cancel/${paymentId}`,
        method: "POST",
        headers: AddAccessToken(session),
    });

    return response.data;
}

export const triggerMonthlyBilling = async (session: Session) => {
    const response = await RequestApi<null, null>({
        path: "/company/billing/scheduler/trigger",
        method: "POST",
        headers: AddAccessToken(session),
    });

    return response.data;
}
