import { z } from "zod";
import Person from "../person/person";
import Address, { SchemaAddressClient } from "../address/address";
import Decimal from "decimal.js";
import { SchemaContact } from "../contact/contact";

export default class Client extends Person {
    id: string = '';
    constructor(data: Partial<Client> = {}) {
        super({ address: { delivery_tax: new Decimal(0) } as Address });
        Object.assign(this, data);
    }
};

export const SchemaClient = z.object({
    id: z.string().uuid("Id inválido").optional().or(z.literal('')),
    image_path: z.string().url('Caminho da imagem inválido').optional().or(z.literal('')),
    name: z.string().min(3, 'Nome precisa ter pelo menos 3 caracteres').max(100, 'Nome precisa ter no máximo 100 caracteres'),
    email: z.string().email('Email inválido').optional().or(z.literal('')),
    cpf: z.string().min(11, 'CPF inválido').max(14, 'CPF inválido').optional().or(z.literal('')),
    birthday: z.string().optional(),
    contact: SchemaContact,
    address: SchemaAddressClient,
});

export type ClientFormData = z.infer<typeof SchemaClient>

export const ValidateClientForm = (client: Client) => {
    const validatedFields = SchemaClient.safeParse({
        name: client.name,
        contact: client.contact,
        address: client.address,
    });

    if (!validatedFields.success) {
        return validatedFields.error.flatten().fieldErrors;
    }

    return {}
};