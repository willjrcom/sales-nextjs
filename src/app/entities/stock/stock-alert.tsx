import Product from "../product/product";

export default class StockAlert {
    id: string = "";
    stock_id: string = "";
    type: string = ""; // 'low_stock', 'out_of_stock', 'over_stock'
    message: string = "";
    is_resolved: boolean = false;
    resolved_at?: string;
    resolved_by?: string;
    created_at: string = "";
    product?: Product;

    constructor(data: Partial<StockAlert> = {}) {
        Object.assign(this, data);
    }
} 