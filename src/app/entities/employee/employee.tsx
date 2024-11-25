import { z } from "zod";
import { Person, ValidatePersonForm } from "../person/person";
import { User } from "../user/user";

export default class Employee extends Person {
    user_id: string = '';
    user: User = new User();

    constructor(person: Person = new Person(), user_id: string = '', user: User = new User()) {
        // Call the super constructor with the name and age from the Person object
        super(person.id, person.name, person.email, person.cpf, person.birthday, person.contact, person.address, false);
        this.user_id = user_id;
        this.user = user;
    }
};

const SchemaEmployee = z.object({
});

export const ValidateEmployeeForm = (client: Employee) => {
    const errors = ValidatePersonForm(client);
    const validatedFields = SchemaEmployee.safeParse({
    });

    if (!validatedFields.success) {
        // Usa o método flatten para simplificar os erros
        return { ...errors, ...validatedFields.error.flatten().fieldErrors };
    } 
    return {}
};