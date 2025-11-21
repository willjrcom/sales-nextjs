import { z } from "zod";
import Address, { SchemaAddress } from "../address/address";
import Contact, { SchemaContact } from "../contact/contact";

export default class Person {
    image_path: string = "";
    name: string = "";
    email: string = "";
    cpf: string = "";
    birthday?: string = "";
    contact: Contact = new Contact();
    address: Address = new Address();

    constructor(data: Partial<Person> = {}) {
        Object.assign(this, data);
    }
};

const SchemaPerson = z.object({
    name: z.string().min(3, 'Nome precisa ter pelo menos 3 caracteres').max(100, 'Nome precisa ter no máximo 100 caracteres'),
    cpf: z.string().optional(),
    contact: SchemaContact,
    address: SchemaAddress,
});

export const ValidatePersonForm = (person: Person) => {
    const validatedFields = SchemaPerson.safeParse({
        name: person.name,
        cpf: person.cpf,
        contact: person.contact,
        address: person.address,
    });

    if (!validatedFields.success) {
        // Usa o método flatten para simplificar os erros
        return validatedFields.error.flatten().fieldErrors;
    }
    return {}
};