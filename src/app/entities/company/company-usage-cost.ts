
export interface CompanyUsageCost {
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