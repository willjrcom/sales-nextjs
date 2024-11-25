import { z } from "zod";

class Contact {
    id: string = '';
    ddd: string = '';
    number: string = '';
    type: ContactType = ContactType.Client;
    object_id: string = '';

    constructor() {}
};

enum ContactType {
    Client = "Client",
    Employee = "Employee",
}

export default Contact
export { ContactType }


export const SchemaContact = z.object({
    ddd: z.string().min(2, 'DDD inválido').max(2, 'DDD inválido'),
    number: z.string().min(8, 'Número inválido').max(9, 'Número inválido'),
});