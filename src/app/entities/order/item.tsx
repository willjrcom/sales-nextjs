import Decimal from 'decimal.js';
export default class Item {
    id: string = '';
    name: string = '';
    observation: string = '';
    sub_total: Decimal = new Decimal(0);
    total: Decimal = new Decimal(0);
    size: string = '';
    quantity: number = 0;
    group_item_id: string = '';
    category_id: string = '';
    flavor?: string;
    additional_items?: Item[] = [];
    removed_items?: string[] = [];
    product_id: string = '';

    constructor(data: Partial<Item> = {}) {
        Object.assign(this, data);
    }
};