import Decimal from "decimal.js";

export class EmployeeSalaryHistory {
    id: string = '';
    employee_id: string = '';
    start_date: string = '';
    end_date?: string;
    salary_type: string = '';
    base_salary: Decimal = new Decimal(0);
    hourly_rate: Decimal = new Decimal(0);
    commission: number = 0;
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
    salary_history_id?: string;
    created_at: string = '';
    method: string = '';
    status: string = '';
    notes: string = '';
    constructor(data: Partial<EmployeePayment> = {}) {
        Object.assign(this, data);
    }
}

import { z } from "zod";

export const SchemaEmployeePayment = z.object({
    amount: z.number().min(0.01, "O valor deve ser maior que zero"),
    payment_date: z.string().min(10, "Data inválida"),
    method: z.string().min(1, "Selecione um método"),
    status: z.string().min(1, "Selecione um status"),
    notes: z.string().optional(),
});

export const SchemaEmployeeSalaryHistory = z.object({
    start_date: z.string().min(10, "Data inválida"),
    salary_type: z.string().min(1, "Selecione um tipo"),
    base_salary: z.number().min(0.01, "O salário base deve ser maior que zero"),
    hourly_rate: z.number().min(0.01, "A taxa horária deve ser maior que zero"),
    commission: z.number().optional(),
});