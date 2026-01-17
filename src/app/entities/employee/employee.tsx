import { z } from "zod";
import User, { ValidateUserForm } from "../user/user";

export default class Employee extends User {
    id: string = '';
    user_id: string = '';
    is_active: boolean = true;
    permissions: Record<string, boolean> = {};

    constructor(data: Partial<Employee> = {}) {
        super();
        Object.assign(this, data);
    }

    setPermission(key: string, value: boolean) {
        this.permissions[key] = value;
    }

    getPermission(key: string): boolean {
        return !!this.permissions[key];
    }
};

const SchemaEmployee = z.object({
});

export const ValidateEmployeeForm = (employee: Employee) => {
    const errors = ValidateUserForm(employee);
    const validatedFields = SchemaEmployee.safeParse({
    });

    if (!validatedFields.success) {
        // Usa o método flatten para simplificar os erros
        return { ...errors, ...validatedFields.error.flatten().fieldErrors };
    }

    return {}
};