import { z } from "zod";
import { ValidatePersonForm } from "../person/person";
import User from "../user/user";

export default class Employee {
    id: string = '';
    user_id: string = '';
    user: User = new User();

    constructor(id: string = '', user_id: string = '', user: User = new User()) {
        this.id = id;
        this.user_id = user_id;
        this.user = user;
    }
};

const SchemaEmployee = z.object({
});

export const ValidateEmployeeForm = (employee: Employee) => {
    const errors = ValidatePersonForm(employee.user);
    const validatedFields = SchemaEmployee.safeParse({
    });

    if (!validatedFields.success) {
        // Usa o método flatten para simplificar os erros
        return { ...errors, ...validatedFields.error.flatten().fieldErrors };
    } 
    return errors
};