export interface CheckoutRequestDTO {
    company_id: string;
    cost_ids?: string[];
    plan?: string;        // "BASIC", "INTERMEDIATE", "ENTERPRISE"
    periodicity?: string; // "MONTHLY", "SEMIANNUAL", "ANNUAL"
}

export interface CheckoutResponseDTO {
    payment_id: string;
    init_point: string;
}

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
