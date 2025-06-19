import Decimal from "decimal.js";

export default class DeliveryDriverTax {
    delivery_driver_id: string = '';
    delivery_driver_name: string = '';
    order_number: number = 0;
    delivery_id: string = '';
    delivery_tax: Decimal = new Decimal(0);

    constructor(id: string = '', name: string = '', order_number: number = 0, delivery_id: string = '', delivery_tax: Decimal = new Decimal(0)) {
        this.delivery_driver_id = id;
        this.delivery_driver_name = name;
        this.order_number = order_number;
        this.delivery_id = delivery_id;
        this.delivery_tax = delivery_tax;
    }
}