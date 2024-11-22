type Timestamp = string | null;

// Status for Order Pickup
type StatusOrderPickup = "Staging" | "Pending" | "Ready";

// Common attributes for Order Pickup
interface OrderPickupCommonAttributes {
    name: string;
    status: StatusOrderPickup;
    orderId: string;
}

// Time logs for Order Pickup
interface PickupTimeLogs {
    pending_at?: Timestamp;
    ready_at?: Timestamp;
}

// Main Order Pickup structure
export interface OrderPickup extends OrderPickupCommonAttributes, PickupTimeLogs {
    id: string;
}