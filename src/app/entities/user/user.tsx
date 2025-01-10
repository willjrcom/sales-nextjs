import { z } from "zod";
import Company from "../company/company";
import Person, { ValidatePersonForm } from "../person/person";

export default class User extends Person {
    id: string = '';
    companies: Company [] = [];

    constructor(id: string = '', person: Person = new Person(), companies = []) {
        super(person.name, person.email, person.cpf, person.birthday, person.contact, person.address, true);
        this.id = id;
        this.companies = companies;
    }
};


const SchemaUser = z.object({
});

export const ValidateUserForm = (user: User) => {
    const errors = ValidatePersonForm(user);
    const validatedFields = SchemaUser.safeParse({
    });

    if (!validatedFields.success) {
        // Usa o método flatten para simplificar os erros
        return { ...errors, ...validatedFields.error.flatten().fieldErrors };
    } 
    return errors
};