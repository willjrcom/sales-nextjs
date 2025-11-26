import { z } from "zod";
import Address, { SchemaAddressClient, SchemaAddressUser } from "../address/address";
import Contact, { SchemaContact } from "../contact/contact";

export default class Person {
    image_path: string = '';
    name: string = '';
    email: string = '';
    cpf?: string;
    birthday?: string;
    contact: Contact = new Contact();
    address: Address = new Address();

    constructor(data: Partial<Person> = {}) {
        Object.assign(this, data);
    }
};

const SchemaPersonClient = z.object({
    name: z.string().min(3, 'Nome precisa ter pelo menos 3 caracteres').max(100, 'Nome precisa ter no máximo 100 caracteres'),
    contact: SchemaContact,
    address: SchemaAddressClient,
});

const SchemaPersonUser = z.object({
    name: z.string().min(3, 'Nome precisa ter pelo menos 3 caracteres').max(100, 'Nome precisa ter no máximo 100 caracteres'),
    email: z.string().email('Email inválido'),
    cpf: z.string().min(11, 'CPF precisa ter pelo menos 11 caracteres').max(14, 'CPF precisa ter no máximo 14 caracteres'),
    birthday: z.string(),
    contact: SchemaContact,
    address: SchemaAddressUser,
});

export const ValidatePersonUserForm = (person: Person) => {
    const validatedFields = SchemaPersonUser.safeParse({
        name: person.name,
        email: person.email,
        cpf: person.cpf,
        birthday: person.birthday,
        contact: person.contact,
        address: person.address,
    });

    if (!validatedFields.success) {
        // Usa o método flatten para simplificar os erros
        return validatedFields.error.flatten().fieldErrors;
    }
    return {}
};

export const ValidatePersonClientForm = (person: Person) => {
    const validatedFields = SchemaPersonClient.safeParse({
        name: person.name,
        contact: person.contact,
        address: person.address,
    });

    if (!validatedFields.success) {
        // Usa o método flatten para simplificar os erros
        return validatedFields.error.flatten().fieldErrors;
    }
    return {}
};