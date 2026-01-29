export interface SubscriptionStatus {
    current_plan: 'free' | 'basic' | 'intermediate' | 'advanced';
    expires_at: string | null;
    days_remaining: number | null;
    upcoming_plan: string | null;
    upcoming_start_at: string | null;
}
