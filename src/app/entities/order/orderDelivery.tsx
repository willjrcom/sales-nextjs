import Employee from "../employee/employee";

type Timestamp = string | null;

type StatusOrderDelivery = "Staging" | "Pending" | "Ready" | "Shipped" | "Delivered";

interface OrderDeliveryCommonAttributes {
    status: StatusOrderDelivery;
    delivery_tax?: number;
    client_id: string;
    client?: Client;
    address_id: string;
    address?: Address;
    driver_id?: string;
    driver?: Employee;
    order_id: string;
}

interface DeliveryTimeLogs {
    pending_at?: Timestamp;
    shipped_at?: Timestamp;
    delivered_at?: Timestamp;
}

export interface OrderDelivery extends OrderDeliveryCommonAttributes, DeliveryTimeLogs {
    id: string;
}

interface Client {
    id: string;
    name: string;
    email?: string;
    phone?: string;
}

interface Address {
    id: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
}