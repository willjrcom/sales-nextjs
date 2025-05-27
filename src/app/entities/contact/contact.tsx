import { z } from "zod";

export default class Contact {
    id?: string;
    ddd: string = '';
    number: string = '';
    type: ContactType = ContactType.Client;
    object_id?: string = '';

    constructor(id?: string, ddd = '', number = '', type = ContactType.Client, object_id = '') { 
        this.id = id; 
        this.ddd = ddd; 
        this.number = number; 
        this.type = type; 
        this.object_id = object_id; 
    }
};

export enum ContactType {
    Client = "Client",
    Employee = "Employee",
}

export const SchemaContact = z.object({
    ddd: z.string().length(2, 'Celular: DDD inválido, precisa ter 2 caracteres'),
    number: z.string().min(9, 'Celular: Número min inválido').max(10, 'Celular: Número max inválido'),
});