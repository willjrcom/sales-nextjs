export class EmployeeSalaryHistory {
    id: string = '';
    employee_id: string = '';
    start_date: string = '';
    end_date?: string;
    salary_type: string = '';
    base_salary: string = '';
    hourly_rate: string = '';
    commission: string = '';
    created_at: string = '';
    constructor(data: Partial<EmployeeSalaryHistory> = {}) {
        Object.assign(this, data);
    }
}

export class EmployeePayment {
    id: string = '';
    employee_id: string = '';
    amount: string = '';
    payment_date: string = '';
    payment_type: string = '';
    reference_month: string = '';
    salary_history_id?: string;
    created_at: string = '';
    constructor(data: Partial<EmployeePayment> = {}) {
        Object.assign(this, data);
    }
}