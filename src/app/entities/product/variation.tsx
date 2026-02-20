import Decimal from 'decimal.js';
import Size from "../size/size";

export default class ProductVariation {
    id: string = '';
    product_id: string = '';
    size_id: string = '';
    size: Size = new Size();
    price: Decimal = new Decimal(0);
    cost: Decimal = new Decimal(0);
    is_available: boolean = true;

    constructor(data: Partial<ProductVariation> = {}) {
        Object.assign(this, data);
    }
}
