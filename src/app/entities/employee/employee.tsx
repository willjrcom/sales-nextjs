import { z } from "zod";
import User, { ValidateUserForm } from "../user/user";

export default class Employee extends User {
    id: string = '';
    user_id: string = '';

    constructor(id: string = '', user_id: string = '', user: User = new User()) {
        super(user_id, user);
        this.id = id;
        this.user_id = user_id;
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
    return errors
};