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

    constructor(id = "", group_item_id = "", process_rule_id = "", joined_at = "", left_at = "", duration = 0, duration_formatted = "", created_at = "", updated_at = "") {
        this.id = id;
        this.group_item_id = group_item_id;
        this.process_rule_id = process_rule_id;
        this.joined_at = joined_at;
        this.left_at = left_at;
        this.duration = duration;
        this.duration_formatted = duration_formatted;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }
}
