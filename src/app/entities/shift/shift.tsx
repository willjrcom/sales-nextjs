import Employee from "../employee/employee";
import Decimal from 'decimal.js';
import Order from "../order/order";
import { PaymentOrder } from "../order/order-payment";

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
        payments: PaymentOrder[] = []
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
    }

    /**
     * Total de pedidos finalizados
     */
    getTotalFinishedOrders(): number {
        return this.total_orders_finished || this.orders?.filter(order => order.status === 'Finished').length || 0;
    }
    /**
     * Total de pedidos cancelados
     */
    getTotalCanceledOrders(): number {
        return this.total_orders_canceled || this.orders?.filter(order => order.status === 'Canceled').length || 0;
    }
    /**
     * Soma total de vendas de pedidos finalizados
     */
    getTotalSales(): Decimal {
        return this.total_sales || this.orders
            ?.filter(order => order.status === 'Finished')
            .reduce((sum, order) => sum.plus(order.total_payable), new Decimal(0))
            || new Decimal(0);
    }

}

export class Redeem {
    name: string = "";
    value: Decimal = new Decimal(0);
}