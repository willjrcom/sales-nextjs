import OrderQueue from "../order-queue/order-queue";
import GroupItem from "../order/group-item";
import ProcessRule from "../process-rule/process-rule";
import Product from "../product/product";

type StatusProcess = "Pending" | "Started" | "Finished" | "Paused" | "Continued" | "Cancelled";
type orderType = "Delivery" | "Pickup" | "Table";

export default class OrderProcess {
    id: string = '';
    created_at: string = '';
    order_number: number = 0;
    order_type: orderType = "Delivery";
    employee_id?: string = '';
    group_item_id: string = '';
    group_item?: GroupItem;
    process_rule_id: string = '';
    process_rule?: ProcessRule = new ProcessRule();
    queue?: OrderQueue = new OrderQueue();
    status: StatusProcess = "Pending";
    products: Product[] = [];
    started_at?: string = '';
    paused_at?: string = '';
    continued_at?: string = '';
    finished_at?: string = '';
    cancelled_at?: string = '';
    cancelled_reason?: string;
    duration: number = 0;
    duration_formatted: string = '';
    total_paused: number = 0;


    constructor(data: Partial<OrderProcess> = {}) {
        Object.assign(this, data);
    }
}
