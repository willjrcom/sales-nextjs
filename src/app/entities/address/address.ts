import Decimal from 'decimal.js';
import { z } from 'zod';

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
    distance: number = 0;
    coordinates: Coordinates = new Coordinates();

    constructor(data: Partial<Address> = {}) {
        Object.assign(this, data);
        if (this.delivery_tax && !(this.delivery_tax instanceof Decimal)) {
            this.delivery_tax = new Decimal(this.delivery_tax);
        }
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

export const SchemaAddress = z.object({
    id: z.string().optional().or(z.literal('')),
    object_id: z.string().optional().or(z.literal('')),
    street: z.string({ required_error: 'Rua é obrigatória', invalid_type_error: 'Rua inválida' }).min(3, 'Rua precisa ter pelo menos 3 caracteres').max(100, 'Rua precisa ter no máximo 100 caracteres'),
    number: z.string({ required_error: 'Número é obrigatório', invalid_type_error: 'Número inválido' }).min(1, 'Endereço: Número minimo 1 caracter'),
    neighborhood: z.string({ required_error: 'Bairro é obrigatório', invalid_type_error: 'Bairro inválido' }).min(3, 'Bairro precisa ter pelo menos 3 caracteres').max(100, 'Bairro precisa ter no máximo 100 caracteres'),
    delivery_tax: z.coerce.number({ required_error: 'Taxa de entrega é obrigatória', invalid_type_error: 'Taxa de entrega inválida' }).min(0, 'Taxa de entrega inválida').optional(),
    distance: z.coerce.number().optional(),
    complement: z.string({ required_error: 'Complemento é obrigatório', invalid_type_error: 'Complemento inválido' }).max(100, 'Complemento precisa ter no máximo 100 caracteres').optional(),
    reference: z.string({ required_error: 'Referência é obrigatória', invalid_type_error: 'Referência inválida' }).max(100, 'Referência precisa ter no máximo 100 caracteres').optional(),
    city: z.string({ required_error: 'Cidade é obrigatória', invalid_type_error: 'Cidade inválida' }).min(3, 'Cidade precisa ter pelo menos 3 caracteres').max(100, 'Cidade precisa ter no máximo 100 caracteres'),
    uf: z.string({ required_error: 'Estado é obrigatório', invalid_type_error: 'Estado inválido' }).min(2, 'Estado precisa ter pelo menos 2 caracteres').max(2, 'Estado precisa ter no máximo 2 caracteres'),
    cep: z.string({ required_error: 'Cep é obrigatório', invalid_type_error: 'Cep inválido' }).min(8, 'Cep inválido').max(9, 'Cep inválido').optional().or(z.literal('')),
});
