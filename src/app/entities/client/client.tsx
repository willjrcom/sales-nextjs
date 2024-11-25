import { z } from "zod";
import Person from "../person/person";
import { SchemaContact } from "../contact/contact";

export default class Client extends Person {
    constructor(person: Person = new Person()) {
        super(person.id, person.name, person.email, person.cpf, person.birthday, person.contact, person.address, true);
    }
};

export const SchemaClient = z.object({
    name: z.string().min(3, 'Nome precisa ter pelo menos 3 caracteres').max(100, 'Nome precisa ter no máximo 100 caracteres'),
    email: z.string().email('Email inválido'),
    cpf: z.string().min(11, 'Cpf inválido').max(14, 'Cpf inválido').nullable(),
    birthday: z.string().nullable(),
    contact: SchemaContact,
});