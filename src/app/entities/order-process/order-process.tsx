import OrderQueue from "../order-queue/order-queue";
import GroupItem from "../order/group-item";
import ProcessRule from "../process-rule/process-rule";
import Product from "../product/product";

type StatusProcess = "Pending" | "Started" | "Finished" | "Paused" | "Continued" | "Canceled";

export default class OrderProcess {
    id: string = "";
    employee_id?: string = "";
    group_item_id: string = "";
    group_item?: GroupItem = new GroupItem();
    process_rule_id: string = "";
    process_rule?: ProcessRule = new ProcessRule();
    queue?: OrderQueue = new OrderQueue();
    status: StatusProcess = "Pending";
    products: Product[] = [];
    started_at?: string = "";
    paused_at?: string = "";
    continued_at?: string = "";
    finished_at?: string = "";
    canceled_at?: string = "";
    canceled_reason?: string;
    duration: number = 0;
    duration_formatted: string = "";
    total_paused: number = 0;

    constructor(
        id: string = "",
        employee_id?: string,
        group_item_id: string = "",
        process_rule_id: string = "",
        started_at?: string,
        paused_at?: string,
        continued_at?: string,
        finished_at?: string,
        canceled_at?: string,
        canceled_reason?: string,
        duration: number = 0,
        duration_formatted: string = "",
        total_paused: number = 0,
        status: StatusProcess = "Pending",
        products: Product[] = [],
        group_item?: GroupItem,
        process_rule?: ProcessRule,
        queue?: OrderQueue
    ) {
        this.id = id;
        this.employee_id = employee_id;
        this.group_item_id = group_item_id;
        this.process_rule_id = process_rule_id;
        this.started_at = started_at;
        this.paused_at = paused_at;
        this.continued_at = continued_at;
        this.finished_at = finished_at;
        this.canceled_at = canceled_at;
        this.canceled_reason = canceled_reason;
        this.duration = duration;
        this.duration_formatted = duration_formatted;
        this.total_paused = total_paused;
        this.status = status;
        this.products = products;
        this.group_item = group_item;
        this.process_rule = process_rule;
        this.queue = queue;
    }
}
