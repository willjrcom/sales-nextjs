import Decimal from "decimal.js";

export default class DeliveryDriverTax {
    delivery_driver_id: string = '';
    delivery_driver_name: string = '';
    order_number: number = 0;
    delivery_id: string = '';
    delivery_tax: Decimal = new Decimal(0);

    constructor(data: Partial<DeliveryDriverTax> = {}) {
        Object.assign(this, data);
    }
}