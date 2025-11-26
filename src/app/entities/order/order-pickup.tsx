type StatusOrderPickup = "Staging" | "Pending" | "Ready";

export default class OrderPickup {
    id: string = '';
    name: string = '';
    status: StatusOrderPickup = "Staging";
    orderId: string = '';
    order_number: number = 0;
    pending_at?: string = '';
    ready_at?: string = '';
    delivered_at?: string = '';
    canceled_at?: string = '';

    
    constructor(data: Partial<OrderPickup> = {}) {
        Object.assign(this, data);
    }
}