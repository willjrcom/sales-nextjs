import { z } from "zod";
import Person, { ValidatePersonForm } from "../person/person";

export default class Client extends Person {
    id: string = '';
    constructor(id: string = '', person: Person = new Person()) {
        super(person.name, person.email, person.cpf, person.birthday, person.contact, person.address, true);
        this.id = id;
    }
};

const SchemaClient = z.object({
});

export const ValidateClientForm = (client: Client) => {
    const errors = ValidatePersonForm(client);
    const validatedFields = SchemaClient.safeParse({
    });

    if (!validatedFields.success) {
        return { ...errors, ...validatedFields.error.flatten().fieldErrors };
    } 
    return errors
};