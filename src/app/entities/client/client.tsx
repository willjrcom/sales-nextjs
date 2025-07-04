import { z } from "zod";
import Person, { ValidatePersonForm } from "../person/person";

export default class Client extends Person {
    id: string = '';
    constructor(data: Partial<Client> = {}) {
        super();

        if (data.address) data.address.isClient = true;
        Object.assign(this, data);
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