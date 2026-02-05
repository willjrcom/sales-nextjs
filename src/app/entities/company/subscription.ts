export interface SubscriptionStatus {
    current_plan: string;
    expires_at: string | null;
    days_remaining: number | null;
    upcoming_plan?: string | null;
    upcoming_start_at?: string | null;
    is_cancelled?: boolean;
    frequency?: "MONTHLY" | "SEMIANNUALLY" | "ANNUALLY";
    available_plans?: Plan[];
}

export interface Plan {
    key: string;
    name: string;
    price: number;
    features: string[];
    order: number;
    is_current: boolean;
    is_upgrade: boolean;
    upgrade_price?: number;
}

export enum PlanType {
    FREE = 'free',
    BASIC = 'basic',
    INTERMEDIATE = 'intermediate',
    ADVANCED = 'advanced',
}