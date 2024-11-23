import Employee from "../employee/employee";
import { GroupItem } from "./group-item";
import { OrderDelivery } from "./orderDelivery";
import { OrderPickup } from "./orderPickup";
import { OrderTable } from "./orderTable";

type Timestamp = string | null;

type StatusOrder = "Staging" | "Pending" | "Finished" | "Canceled" | "Archived";

export default interface Order extends OrderCommonAttributes, OrderDetail, OrderType, OrderTimeLogs {
    id: string
}

interface OrderCommonAttributes {
    order_number: number;
    status: StatusOrder;
    groups: GroupItem[];
    payments?: PaymentOrder[];
}
interface OrderDetail extends ScheduledOrder {
    total_payable: number;
    total_paid: number;
    total_change: number;
    quantity_items: number;
    observation: string;
    attendant_id: string;
    attendant?: Employee;
    shift_id?: string;
}

interface OrderType {
    delivery?: OrderDelivery;
    table?: OrderTable;
    pickup?: OrderPickup;
}
interface ScheduledOrder {
    start_at?: Timestamp;
}

interface OrderTimeLogs {
    pending_at?: Timestamp;
    finished_at?: Timestamp;
    canceled_at?: Timestamp;
    archived_at?: Timestamp;
}

interface PaymentOrder {
    id: string;
    amount: number;
    method: string;
}