import RequestApi, { AddAccessToken, GetAllResponse } from "../request";
import { Session } from "next-auth";
import { CompanyPayment } from "@/app/entities/company/company-payment";
import { CompanyUsageCost } from "@/app/entities/company/company-usage-cost";

export interface CheckoutRequestDTO {
    plan?: string;        // "BASIC", "INTERMEDIATE", "ADVANCED"
    periodicity?: string; // "MONTHLY", "SEMIANNUAL", "ANNUAL"
}

export interface CreateCostDTO {
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
        path: "/company/subscription/checkout",
        method: "POST",
        body: data,
        headers: AddAccessToken(session),
    });

    return response.data;
}


export const createCost = async (session: Session, data: CreateCostDTO) => {
    const response = await RequestApi<CreateCostDTO, null>({
        path: "/company/cost/register",
        method: "POST",
        body: data,
        headers: AddAccessToken(session),
    });

    return response.data;
}

export const listPayments = async (session: Session, page = 0, perPage = 10, month?: number, year?: number): Promise<GetAllResponse<CompanyPayment>> => {
    let path = `/company/payment?page=${page}&per_page=${perPage}`;
    if (month) path += `&month=${month}`;
    if (year) path += `&year=${year}`;

    const response = await RequestApi<null, CompanyPayment[]>({
        path: path,
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
        path: `/company/cost/monthly?month=${month}&year=${year}&page=${page}`,
        method: "GET",
        headers: AddAccessToken(session),
    });

    return response.data;
}

export const cancelPayment = async (session: Session, paymentId: string) => {
    const response = await RequestApi<null, null>({
        path: `/company/payment/cancel/${paymentId}`,
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

export const cancelSubscription = async (session: Session) => {
    const response = await RequestApi<null, null>({
        path: "/company/subscription/cancel",
        method: "POST",
        headers: AddAccessToken(session),
    });

    return response.data;
}

export interface UpgradeSimulationResponse {
    target_plan: string;
    upgrade_amount: number;
}

export const simulateUpgrade = async (session: Session, targetPlan: string) => {
    const response = await RequestApi<null, UpgradeSimulationResponse>({
        path: `/company/subscription/simulate/upgrade?target_plan=${targetPlan}`,
        method: "GET",
        headers: AddAccessToken(session),
    });

    return response.data;
}

export const createUpgradeCheckout = async (session: Session, targetPlan: string) => {
    const response = await RequestApi<{ target_plan: string }, CheckoutResponseDTO>({
        path: "/company/subscription/checkout/upgrade",
        method: "POST",
        body: { target_plan: targetPlan },
        headers: AddAccessToken(session),
    });

    return response.data;
}
