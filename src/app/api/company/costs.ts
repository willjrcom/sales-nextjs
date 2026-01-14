import { Session } from "next-auth";
import Decimal from "decimal.js";
import RequestApi, { AddAccessToken } from "../request";

// Monthly Cost Summary
// Backend sends decimal.Decimal as string or object, handle both
export interface MonthlyCostSummary {
    company_id: string;
    month: number;
    year: number;
    total_amount: string | number;
    costs_by_type: Record<string, string | number>;
    costs_count: number;
    subscription_fee: string | number;
    nfce_costs: string | number;
    nfce_count: number;
}

// Cost Breakdown
export interface CompanyUsageCost {
    id: string;
    company_id: string;
    cost_type: string;
    description: string;
    amount: string | number;
    reference_id?: string;
    billing_month: number;
    billing_year: number;
    created_at: string;
}

export interface CostBreakdown {
    company_id: string;
    month: number;
    year: number;
    costs: CompanyUsageCost[];
    total_amount: string;
}


// Get monthly cost summary
export async function getMonthlyCostSummary(
    session: Session,
    month?: number,
    year?: number,
) {
    const now = new Date();
    const targetMonth = month ?? now.getMonth() + 1;
    const targetYear = year ?? now.getFullYear();

    const response = await RequestApi<null, MonthlyCostSummary>({
        path: `/company-usage-cost/costs/monthly?month=${targetMonth}&year=${targetYear}`,
        method: "GET",
        headers: AddAccessToken(session),
    });

    return response.data;
}

// Get cost breakdown
export async function getCostBreakdown(
    session: Session,
    month?: number,
    year?: number,
) {
    const now = new Date();
    const targetMonth = month ?? now.getMonth() + 1;
    const targetYear = year ?? now.getFullYear();

    const response = await RequestApi<null, CostBreakdown>({
        path: `/company-usage-cost/costs/breakdown?month=${targetMonth}&year=${targetYear}`,
        method: "GET",
        headers: AddAccessToken(session),
    });

    return response.data;
}

// Enable fiscal invoices
export async function enableFiscalInvoices(session: Session) {
    const response = await RequestApi<null, { message: string; enabled: boolean }>({
        path: "/company-usage-cost/fiscal/enable",
        method: "POST",
        headers: AddAccessToken(session),
    });

    return response.data;
}

// Disable fiscal invoices
export async function disableFiscalInvoices(session: Session) {
    const response = await RequestApi<null, { message: string; enabled: boolean }>({
        path: "/company-usage-cost/fiscal/disable",
        method: "POST",
        headers: AddAccessToken(session),
    });

    return response.data;
}

// Next Invoice Preview
export interface EnabledService {
    name: string;
    enabled: boolean;
    fixed_cost: string | number;
    usage_cost: string | number;
    unit_cost?: string | number;
    usage_count?: number;
    description: string;
}

export interface NextInvoicePreview {
    company_id: string;
    next_billing_date: string;
    enabled_services: EnabledService[];
    estimated_total: string | number;
    current_month_usage: string | number;
    nfce_count: number;
}

// Get next invoice preview
export async function getNextInvoicePreview(session: Session) {
    const response = await RequestApi<null, NextInvoicePreview>({
        path: "/company-usage-cost/next-invoice",
        method: "GET",
        headers: AddAccessToken(session),
    });

    return response.data;
}
