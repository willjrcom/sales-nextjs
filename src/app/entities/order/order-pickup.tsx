type StatusOrderPickup = "Staging" | "Pending" | "Ready";

export default class OrderPickup {
    id: string = "";
    name: string = "";
    status: StatusOrderPickup = "Staging";
    orderId: string = "";
    order_number: number = 0;
    pending_at?: string = "";
    ready_at?: string = "";
    delivered_at?: string = "";
    canceled_at?: string = "";

    constructor(id = "", name = "", status: StatusOrderPickup = "Staging", orderId = "", orderNumber = 0, pending_at = "", ready_at = "", delivered_at = "") {
        this.id = id;
        this.name = name;
        this.status = status;
        this.orderId = orderId;
        this.order_number = orderNumber;
        this.pending_at = pending_at;
        this.ready_at = ready_at;
        this.delivered_at = delivered_at;
    }
}