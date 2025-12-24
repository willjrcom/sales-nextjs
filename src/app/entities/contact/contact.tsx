import { z } from "zod";

export default class Contact {
    id?: string;
    ddd: string = '';
    number: string = '';
    type: ContactType = ContactType.Client;
    object_id?: string = '';

    constructor(data: Partial<Contact> = {}) {
        Object.assign(this, data);
    }
};

export enum ContactType {
    Client = "Client",
    Employee = "Employee",
}

export const SchemaContact = z.object({
    ddd: z.string().length(2, 'Celular: DDD inválido, precisa ter 2 caracteres').or(z.literal('')),
    number: z.string().min(9, 'Celular: Número inválido').max(10, 'Celular: Número inválido').or(z.literal('')),
    type: z.nativeEnum(ContactType),
});