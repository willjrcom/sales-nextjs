import Employee from "../employee/employee";
import Decimal from 'decimal.js';
import Order from "../order/order";
import { PaymentOrder } from "../order/order-payment";
import DeliveryDriverTax from "./delivery-driver-tax";
import Redeem from "./redeem";

// Interfaces para analytics de produção
interface OrderProcessAnalytics {
    process_rule_id: string;
    process_rule_name: string;
    total_processes: number;
    completed_processes: number;
    canceled_processes: number;
    average_process_time: number; // em segundos
    total_process_time: number; // em segundos
    total_paused_count: number;
    efficiency_score: number;
    categories_processed: Record<string, CategoryProcessMetrics>;
    employee_performance: Record<string, EmployeeProcessMetrics>;
}

interface QueueAnalytics {
    process_rule_id: string;
    process_rule_name: string;
    total_queues: number;
    completed_queues: number;
    average_queue_time: number; // em segundos
    total_queue_time: number; // em segundos
}

interface CategoryProcessMetrics {
    category_id: string;
    category_name: string;
    total_processes: number;
    average_process_time: number; // em segundos
}

interface EmployeeProcessMetrics {
    employee_id: string;
    employee_name: string;
    total_processes: number;
    completed_processes: number;
    average_process_time: number; // em segundos
    efficiency_score: number;
}

export default class Shift {
    id: string = "";
    current_order_number: number = 0;
    orders: Order[] = [];
    redeems: Redeem[] = [];
    start_change: Decimal = new Decimal(0);
    end_change: Decimal = new Decimal(0);
    attendant_id: string = "";
    attendant: Employee = new Employee();
    opened_at: string = "";
    closed_at: string = "";

	total_orders_finished: number = 0;
	total_orders_canceled: number = 0;
	total_sales: Decimal = new Decimal(0);
	sales_by_category: Record<string,Decimal> = {};
	products_sold_by_category: Record<string,number> = {};
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

    constructor(
        id: string = "",
        current_order_number: number = 0,
        orders: Order[] = [],
        redeems: Redeem[] = [],
        start_change: Decimal = new Decimal(0),
        end_change: Decimal = new Decimal(0),
        attendant_id: string = "",
        attendant: Employee = new Employee(),
        opened_at: string = "",
        closed_at: string = "",
        total_orders_finished: number = 0,
        total_orders_canceled: number = 0,
        total_sales: Decimal = new Decimal(0),
        sales_by_category: Record<string,Decimal> = {},
        products_sold_by_category: Record<string,number> = {},
        total_items_sold: number = 0,
        average_order_value: Decimal = new Decimal(0),
        payments: PaymentOrder[] = [],
        delivery_drivers: DeliveryDriverTax[] = [],
        order_process_analytics: Record<string, OrderProcessAnalytics> = {},
        queue_analytics: Record<string, QueueAnalytics> = {},
        total_processes: number = 0,
        total_queues: number = 0,
        average_process_time: number = 0,
        average_queue_time: number = 0,
        process_efficiency_score: number = 0
    ) {
        this.id = id;
        this.current_order_number = current_order_number;
        this.orders = orders;
        this.redeems = redeems;
        this.start_change = start_change;
        this.end_change = end_change;
        this.attendant_id = attendant_id;
        this.attendant = attendant;
        this.opened_at = opened_at;
        this.closed_at = closed_at;
        this.total_orders_finished = total_orders_finished;
        this.total_orders_canceled = total_orders_canceled;
        this.total_sales = total_sales;
        this.sales_by_category = sales_by_category;
        this.products_sold_by_category = products_sold_by_category;
        this.total_items_sold = total_items_sold;
        this.average_order_value = average_order_value;
        this.payments = payments;
        this.delivery_drivers = delivery_drivers;
        this.order_process_analytics = order_process_analytics;
        this.queue_analytics = queue_analytics;
        this.total_processes = total_processes;
        this.total_queues = total_queues;
        this.average_process_time = average_process_time;
        this.average_queue_time = average_queue_time;
        this.process_efficiency_score = process_efficiency_score;
    }
}
