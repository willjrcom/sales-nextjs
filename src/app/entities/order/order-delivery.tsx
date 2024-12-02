import Address from "../address/address";
import Client from "../client/client";
import Employee from "../employee/employee";

type Timestamp = string | null;

type StatusOrderDelivery = "Staging" | "Pending" | "Ready" | "Shipped" | "Delivered";

export default class OrderDelivery {
    id: string = "";
    status: StatusOrderDelivery = "Staging";
    delivery_tax?: number = 0;
    client_id: string = "";
    client?: Client = new Client();
    address_id: string = "";
    address?: Address;
    driver_id?: string = "";
    driver?: Employee;
    order_id: string = "";
    pending_at?: Timestamp = "";
    shipped_at?: Timestamp = "";
    delivered_at?: Timestamp = "";

    constructor(id = "", status: StatusOrderDelivery = "Staging", delivery_tax = 0, client_id = "", address_id = "", driver_id = "", order_id = "", pending_at = "", shipped_at = "", delivered_at = "") {
        this.id = id;
        this.status = status;
        this.delivery_tax = delivery_tax;
        this.client_id = client_id;
        this.address_id = address_id;
        this.driver_id = driver_id;
        this.order_id = order_id;
        this.pending_at = pending_at;
        this.shipped_at = shipped_at;
        this.delivered_at = delivered_at;
    }
}