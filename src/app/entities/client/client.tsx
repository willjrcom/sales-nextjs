import { z } from "zod";
import Person, { ValidatePersonForm } from "../person/person";
import { SchemaContact } from "../contact/contact";

export default class Client extends Person {
    constructor(person: Person = new Person()) {
        super(person.id, person.name, person.email, person.cpf, person.birthday, person.contact, person.address, true);
    }
};

const SchemaClient = z.object({
});

export const ValidateClientForm = (client: Client) => {
    const errors = ValidatePersonForm(client);
    const validatedFields = SchemaClient.safeParse({
    });

    if (!validatedFields.success) {
        // Usa o método flatten para simplificar os erros
        return { ...errors, ...validatedFields.error.flatten().fieldErrors };
    } 
    return {}
};