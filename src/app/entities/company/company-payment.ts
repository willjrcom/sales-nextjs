export interface CompanyPayment {
    id: string;
    status: string;
    amount: string;
    created_at: string;
    paid_at?: string;
    months: number;
    plan_type?: string;
    provider_payment_id: string;
    payment_url: string;
    external_reference: string;
    expires_at?: string;
    is_mandatory: boolean;
}