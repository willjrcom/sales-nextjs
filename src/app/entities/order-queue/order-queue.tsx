export default class OrderQueue {
    id: string = "";
    group_item_id: string = "";
    process_rule_id?: string = "";
    joined_at: string = "";
    left_at?: string = "";
    duration: number = 0;
    duration_formatted: string = "";
    created_at: string = "";
    updated_at?: string = "";

    constructor(data: Partial<OrderQueue> = {}) {
        Object.assign(this, data);
    }
}
