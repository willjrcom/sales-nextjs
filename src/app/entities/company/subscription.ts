export interface SubscriptionStatus {
    current_plan: string;
    expires_at: string | null;
    days_remaining: number | null;
    upcoming_plan?: string | null;
    upcoming_start_at?: string | null;
    can_cancel_renewal?: boolean;
}

export enum PlanType {
    FREE = 'free',
    BASIC = 'basic',
    INTERMEDIATE = 'intermediate',
    ADVANCED = 'advanced',
}