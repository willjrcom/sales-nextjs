import { z } from "zod";
import Decimal from 'decimal.js';

export default class Address {
    id?: string;
    object_id?: string = '';
    street: string = '';
    number: string = '';
    complement: string = '';
    reference: string = '';
    neighborhood: string = '';
    city: string = '';
    uf: string = '';
    cep: string = '';
    delivery_tax: Decimal = new Decimal(0);
    coordinates: Coordinates = new Coordinates();
    address_type: string = '';

    constructor(data: Partial<Address> = {}) {
        Object.assign(this, data);
    }
    public getSmallAddress() {
        const parts = [
            this.street,
            this.number,
            this.neighborhood,
        ];

        return parts.filter(Boolean).join(", ");
    }

    public getMediumAddress() {
        const parts = [
            this.street,
            this.number,
            this.complement,
            this.neighborhood,
        ];

        return parts.filter(Boolean).join(", ");
    }
    toString() {
        const parts = [
            this.street,
            this.number,
            this.neighborhood,
            this.city,
            this.uf,
        ];

        // Filtra os campos que são null, undefined ou strings vazias
        return parts.filter(Boolean).join(", ");
    }
}

export class Coordinates {
    latitude: number = 0;
    longitude: number = 0;

    constructor(data: Partial<Coordinates> = {}) {
        Object.assign(this, data);
    }
}

export const SchemaAddressClient = z.object({
    street: z.string().min(3, 'Rua precisa ter pelo menos 3 caracteres').max(100, 'Rua precisa ter no máximo 100 caracteres'),
    number: z.string().min(1, 'Endereço: Número minimo 1 caracter'),
    neighborhood: z.string().min(3, 'Bairro precisa ter pelo menos 3 caracteres').max(100, 'Bairro precisa ter no máximo 100 caracteres'),
    delivery_tax: z.coerce.number().min(0, 'Taxa de entrega inválida').optional(),
    complement: z.string().max(100, 'Complemento precisa ter no máximo 100 caracteres').optional(),
    reference: z.string().max(100, 'Referência precisa ter no máximo 100 caracteres').optional(),
    city: z.string().min(3, 'Cidade precisa ter pelo menos 3 caracteres').max(100, 'Cidade precisa ter no máximo 100 caracteres'),
    uf: z.string().min(2, 'Estado precisa ter pelo menos 2 caracteres').max(2, 'Estado precisa ter no máximo 2 caracteres'),
    cep: z.string().min(8, 'Cep inválido').max(9, 'Cep inválido').optional().or(z.literal('')),
    coordinates: z.object({
        latitude: z.number().optional(),
        longitude: z.number().optional(),
    }).optional(),
    address_type: z.string().optional(),
});

export const ValidateAddressClientForm = (address: Address) => {
    const validatedFields = SchemaAddressClient.safeParse({
        street: address.street,
        number: address.number,
        neighborhood: address.neighborhood,
        delivery_tax: new Decimal(address.delivery_tax).toNumber(),
    });

    if (!validatedFields.success) {
        // Usa o método flatten para simplificar os erros
        return validatedFields.error.flatten().fieldErrors;
    }
    return {}
};


export const SchemaAddressUser = z.object({
    cep: z.string().min(8, 'Cep inválido').max(9, 'Cep inválido').optional().or(z.literal('')),
    street: z.string().min(3, 'Rua precisa ter pelo menos 3 caracteres').max(100, 'Rua precisa ter no máximo 100 caracteres'),
    number: z.string().min(1, 'Endereço: Número minimo 1 caracter'),
    neighborhood: z.string().min(3, 'Bairro precisa ter pelo menos 3 caracteres').max(100, 'Bairro precisa ter no máximo 100 caracteres'),
    city: z.string().min(3, 'Cidade precisa ter pelo menos 3 caracteres').max(100, 'Cidade precisa ter no máximo 100 caracteres').optional(),
    uf: z.string().min(2, 'Estado precisa ter pelo menos 2 caracteres').max(2, 'Estado precisa ter no máximo 2 caracteres').optional(),
});

export const ValidateAddressUserForm = (address: Address) => {
    const validatedFields = SchemaAddressUser.safeParse({
        cep: address.cep,
        street: address.street,
        number: address.number,
        neighborhood: address.neighborhood,
        city: address.city,
        uf: address.uf,
    });

    if (!validatedFields.success) {
        // Usa o método flatten para simplificar os erros
        return validatedFields.error.flatten().fieldErrors;
    }
    return {}
};