import Employee from "../employee/employee";
import Decimal from 'decimal.js';
import Order from "../order/order";

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
        closed_at: string = ""
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
    }


    /**
     * Total de pedidos no turno
     */
    getTotalOrders(): number {
        return this.orders?.length || 0;
    }
    /**
     * Total de pedidos finalizados
     */
    getTotalFinishedOrders(): number {
        return this.orders?.filter(order => order.status === 'Finished').length || 0;
    }
    /**
     * Total de pedidos cancelados
     */
    getTotalCanceledOrders(): number {
        return this.orders?.filter(order => order.status === 'Canceled').length || 0;
    }
    /**
     * Soma total de vendas de pedidos finalizados
     */
    getTotalSales(): Decimal {
        return this.orders
            ?.filter(order => order.status === 'Finished')
            .reduce((sum, order) => sum.plus(order.total_payable), new Decimal(0))
            || new Decimal(0);
    }

}

export class Redeem {
    name: string = "";
    value: Decimal = new Decimal(0);
}