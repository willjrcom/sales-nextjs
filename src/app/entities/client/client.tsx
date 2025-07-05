import { z } from "zod";
import Person, { ValidatePersonForm } from "../person/person";
import Address from "../address/address";
import Decimal from "decimal.js";

export default class Client extends Person {
    id: string = '';
    constructor(data: Partial<Client> = {}) {
        super({ address: { isClient: true, delivery_tax: new Decimal(0) } as Address });
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