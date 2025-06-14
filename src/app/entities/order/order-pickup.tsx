type StatusOrderPickup = "Staging" | "Pending" | "Ready";

export default class OrderPickup {
    id: string = "";
    name: string = "";
    status: StatusOrderPickup = "Staging";
    orderId: string = "";
    pending_at?: string = "";
    ready_at?: string = "";
    delivered_at?: string = "";

    constructor(id = "", name = "", status: StatusOrderPickup = "Staging", orderId = "", pending_at = "", ready_at = "", delivered_at = "") {
        this.id = id;
        this.name = name;
        this.status = status;
        this.orderId = orderId;
        this.pending_at = pending_at;
        this.ready_at = ready_at;
        this.delivered_at = delivered_at;
    }
}