import Employee from "../employee/employee";
import Decimal from 'decimal.js';
import Order from "../order/order";
import { PaymentOrder } from "../order/order-payment";
import DeliveryDriverTax from "./delivery-driver-tax";
import Redeem from "./redeem";
import { OrderProcessAnalytics, QueueAnalytics } from "./metrics";
export default class Shift {
    id: string = '';
    current_order_number: number = 0;
    orders: Order[] = [];
    redeems: Redeem[] = [];
    start_change: Decimal = new Decimal(0);
    end_change: Decimal = new Decimal(0);
    attendant_id: string = '';
    attendant: Employee = new Employee();
    opened_at: string = '';
    closed_at: string = '';

    total_orders_finished: number = 0;
    total_orders_cancelled: number = 0;
    total_sales: Decimal = new Decimal(0);
    sales_by_category: Record<string, Decimal> = {};
    products_sold_by_category: Record<string, number> = {};
    total_items_sold: number = 0;
    average_order_value: Decimal = new Decimal(0);
    payments: PaymentOrder[] = [];
    delivery_drivers: DeliveryDriverTax[] = [];

    // Campos de analytics de produção
    order_process_analytics: Record<string, OrderProcessAnalytics> = {};
    queue_analytics: Record<string, QueueAnalytics> = {};
    total_processes: number = 0;
    total_queues: number = 0;
    average_process_time: number = 0; // em segundos
    average_queue_time: number = 0; // em segundos
    process_efficiency_score: number = 0;

    constructor(data: Partial<Shift> = {}) {
        Object.assign(this, data);
    }
}
