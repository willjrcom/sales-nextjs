export interface SubscriptionStatus {
    current_plan: PlanType;
    expires_at: string | null;
    days_remaining: number | null;
    upcoming_plan: string | null;
    upcoming_start_at: string | null;
}

export enum PlanType {
    FREE = 'free',
    BASIC = 'basic',
    INTERMEDIATE = 'intermediate',
    ADVANCED = 'advanced',
}