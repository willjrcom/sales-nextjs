export default class OrderGroupItemSnapshot {
    id: string = '';
    created_at: string = '';
    group_item_id: string = '';
    data: string = '';

    constructor(data: Partial<OrderGroupItemSnapshot> = {}) {
        Object.assign(this, data);
    }
}
