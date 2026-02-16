import Employee from "../employee/employee";
import Decimal from 'decimal.js';
import GroupItem from "./group-item";
import OrderDelivery from "./order-delivery";
import { PaymentOrder } from "./order-payment";
import OrderPickup from "./order-pickup";
import OrderTable from "./order-table";

export type StatusOrder = "Staging" | "Pending" | "Ready" | "Finished" | "Cancelled" | "Archived";

export default class Order {
    id: string = '';
    order_number: number = 0;
    status: StatusOrder = "Staging";
    group_items: GroupItem[] = [];
    payments?: PaymentOrder[] = [];
    total_payable: Decimal = new Decimal(0);
    total_paid: Decimal = new Decimal(0);
    total_change: Decimal = new Decimal(0);
    quantity_items: number = 0;
    observation: string = '';
    attendant_id: string = '';
    attendant?: Employee;
    shift_id?: string = '';
    delivery?: OrderDelivery;
    table?: OrderTable;
    pickup?: OrderPickup;
    created_at: string = '';
    pending_at?: string;
    finished_at?: string;
    ready_at?: string;
    cancelled_at?: string;
    archived_at?: string;

    constructor(data: Partial<Order> = {}) {
        Object.assign(this, data);
    }
}
