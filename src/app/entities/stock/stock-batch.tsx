import Decimal from 'decimal.js';

export default class StockBatch {
    id: string = '';
    stock_id: string = '';
    product_variation_id?: string;
    initial_quantity: Decimal = new Decimal(0);
    current_quantity: Decimal = new Decimal(0);
    cost_price: Decimal = new Decimal(0);
    expires_at?: string;
    created_at: string = '';

    constructor(data: Partial<StockBatch> = {}) {
        Object.assign(this, data);
    }
}
