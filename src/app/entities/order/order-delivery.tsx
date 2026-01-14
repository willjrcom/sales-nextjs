import Address from "../address/address";
import Client from "../client/client";
import DeliveryDriver from "../delivery-driver/delivery-driver";
import Decimal from 'decimal.js';

type StatusOrderDelivery = "Staging" | "Pending" | "Ready" | "Shipped" | "Delivered" | "Canceled";

export default class OrderDelivery {
    id: string = '';
    status: StatusOrderDelivery = "Staging";
    delivery_tax?: Decimal = new Decimal(0);
    is_delivery_free: boolean = false;
    change?: Decimal = new Decimal(0);
    payment_method?: string = '';
    client_id: string = '';
    client?: Client = new Client();
    address_id: string = '';
    address?: Address;
    driver_id?: string = '';
    driver?: DeliveryDriver;
    order_id: string = '';
    order_number: number = 0;
    pending_at?: string = '';
    ready_at?: string = '';
    shipped_at?: string = '';
    delivered_at?: string = '';
    canceled_at?: string = '';

    constructor(data: Partial<OrderDelivery> = {}) {
        Object.assign(this, data);
    }
}