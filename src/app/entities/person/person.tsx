import { z } from "zod";
import Address, { SchemaAddress } from "../address/address";
import Contact, { SchemaContact } from "../contact/contact";

export default class Person {
    id: string = "";
    name: string = "";
    email: string = "";
    cpf: string = "";
    birthday?: string = "";
    contact: Contact = new Contact();
    address: Address = new Address();

    constructor(id: string = "", name: string = "", email: string = "", cpf: string = "", birthday: string = "", contact: Contact = new Contact(), address: Address = new Address(), likeTax: boolean = false) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.cpf = cpf;
        this.birthday = birthday;
        this.contact = contact;
        this.address = address;
        this.address.likeTax = likeTax
    }
};

const SchemaPerson = z.object({
    name: z.string().min(3, 'Nome precisa ter pelo menos 3 caracteres').max(100, 'Nome precisa ter no máximo 100 caracteres'),
    cpf: z.string().optional(),
    birthday: z.string().nullable(),
    contact: SchemaContact,
    address: SchemaAddress,
});

export const ValidatePersonForm = (person: Person) => {
    const validatedFields = SchemaPerson.safeParse({
        name: person.name,
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