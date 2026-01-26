

export interface CompanyUsageCost {
    id: string;
    company_id: string;
    cost_type: string;
    description: string;
    amount: number;
    original_amount?: number;
    status: string;
    month: number;
    year: number;
    payment_id?: string;
}
