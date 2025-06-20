import Decimal from "decimal.js";

export class EmployeeSalaryHistory {
    id: string = '';
    employee_id: string = '';
    start_date: string = '';
    end_date?: string;
    salary_type: string = '';
    base_salary: Decimal = new Decimal(0);
    hourly_rate: Decimal = new Decimal(0);
    commission: Decimal = new Decimal(0);
    created_at: string = '';
    method: string = '';
    notes: string = '';
    constructor(data: Partial<EmployeeSalaryHistory> = {}) {
        Object.assign(this, data);
    }
}

export class EmployeePayment {
    id: string = '';
    employee_id: string = '';
    amount: Decimal = new Decimal(0);
    payment_date: string = '';
    payment_type: string = '';
    reference_month: string = '';
    salary_history_id?: string;
    created_at: string = '';
    method: string = '';
    status: string = '';
    notes: string = '';
    constructor(data: Partial<EmployeePayment> = {}) {
        Object.assign(this, data);
    }
}