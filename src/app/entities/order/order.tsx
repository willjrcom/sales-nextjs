import Employee from "../employee/employee";
import GroupItem from "./group-item";
import OrderDelivery from "./orderDelivery";
import OrderPickup from "./orderPickup";
import OrderTable from "./orderTable";

type Timestamp = string | null;

type StatusOrder = "Staging" | "Pending" | "Finished" | "Canceled" | "Archived";

export default class Order {
    id: string = "";
    order_number: number = 0;
    status: StatusOrder = "Staging";
    groups: GroupItem[] = [];
    payments?: PaymentOrder[] = [];
    total_payable: number = 0;
    total_paid: number = 0;
    total_change: number = 0;
    quantity_items: number = 0;
    observation: string = "";
    attendant_id: string = "";
    attendant?: Employee = new Employee();
    shift_id?: string = "";
    delivery?: OrderDelivery = new OrderDelivery();
    table?: OrderTable = new OrderTable();
    pickup?: OrderPickup = new OrderPickup();
    start_at?: Timestamp = "";
    pending_at?: Timestamp = "";
    finished_at?: Timestamp = "";
    canceled_at?: Timestamp = "";
    archived_at?: Timestamp = "";

    constructor(id = "", order_number = 0, status: StatusOrder = "Staging", groups: GroupItem[] = [], payments: PaymentOrder[] = [], total_payable = 0, total_paid = 0, total_change = 0, quantity_items = 0, observation = "", attendant_id = "", start_at = "", pending_at = "", finished_at = "", canceled_at = "", archived_at = "") {
        this.id = id;
        this.order_number = order_number;
        this.status = status;
        this.groups = groups;
        this.payments = payments;
        this.total_payable = total_payable;
        this.total_paid = total_paid;
        this.total_change = total_change;
        this.quantity_items = quantity_items;
        this.observation = observation;
        this.attendant_id = attendant_id;
        this.start_at = start_at;
        this.pending_at = pending_at;
        this.finished_at = finished_at;
        this.canceled_at = canceled_at;
        this.archived_at = archived_at;
    }
}

interface PaymentOrder {
    id: string;
    amount: number;
    method: string;
}