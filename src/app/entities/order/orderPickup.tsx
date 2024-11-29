type Timestamp = string | null;
type StatusOrderPickup = "Staging" | "Pending" | "Ready";

export default class OrderPickup {
    id: string = "";
    name: string = "";
    status: StatusOrderPickup = "Staging";
    orderId: string = "";
    pending_at?: Timestamp = "";
    ready_at?: Timestamp = "";

    constructor(id = "", name = "", status: StatusOrderPickup = "Staging", orderId = "", pending_at = "", ready_at = "") {
        this.id = id;
        this.name = name;
        this.status = status;
        this.orderId = orderId;
        this.pending_at = pending_at;
        this.ready_at = ready_at;
    }
}