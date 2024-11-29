import { z } from "zod";

export default class Contact {
    id: string = '';
    ddd: string = '';
    number: string = '';
    type: ContactType = ContactType.Client;
    object_id: string = '';

    constructor(id = '', ddd = '', number = '', type = ContactType.Client, object_id = '') { 
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
    ddd: z.string().min(2, 'DDD inválido').max(2, 'DDD inválido'),
    number: z.string().min(8, 'Número inválido').max(9, 'Número inválido'),
});