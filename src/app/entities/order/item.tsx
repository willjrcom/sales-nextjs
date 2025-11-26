import Decimal from 'decimal.js';
export default class Item {
    id: string = '';
    name: string = '';
    observation: string = '';
    price: Decimal = new Decimal(0);
    total_price: Decimal = new Decimal(0);
    size: string = '';
    quantity: number = 0;
    group_item_id: string = '';
    category_id: string = '';
    additional_items?: Item[] = [];
    removed_items?: string[] = [];
    product_id: string = '';

    constructor(data: Partial<Item> = {}) {
        Object.assign(this, data);
    }
};