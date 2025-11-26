import { z } from "zod";
import Company from "../company/company";
import Person, { ValidatePersonUserForm } from "../person/person";

export default class User extends Person {
    id: string = '';
    companies: Company [] = [];

    constructor(data: Partial<User> = {}) {
        super();
        Object.assign(this, data);
    }
};


const SchemaUser = z.object({
});

export const ValidateUserForm = (user: User) => {
    const errors = ValidatePersonUserForm(user);
    const validatedFields = SchemaUser.safeParse({
    });

    if (!validatedFields.success) {
        // Usa o método flatten para simplificar os erros
        return { ...errors, ...validatedFields.error.flatten().fieldErrors };
    } 
    return errors
};