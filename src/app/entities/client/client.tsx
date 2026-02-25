import { z } from "zod";
import Person from "../person/person";
import Address from "../address/address";
import Decimal from "decimal.js";
import { ContactType } from "../contact/contact";

export default class Client extends Person {
    id: string = '';
    is_active: boolean = true;
    constructor(data: Partial<Client> = {}) {
        super({ address: { delivery_tax: new Decimal(0) } as Address });
        Object.assign(this, data);
    }
};

export const SchemaClient = z.object({
    id: z.string({ required_error: 'Id é obrigatório' }).uuid("Id inválido").optional().or(z.literal('')),
    name: z.string({ required_error: 'Nome é obrigatório', invalid_type_error: 'Nome inválido' }).min(3, 'Nome precisa ter pelo menos 3 caracteres').max(100, 'Nome precisa ter no máximo 100 caracteres'),
    contact: z.string({ required_error: 'Celular é obrigatório', invalid_type_error: 'Celular inválido' }).min(9, 'Celular: Número inválido').max(15, 'Celular: Número inválido'),

    image_path: z.string({ required_error: 'Imagem é obrigatória', invalid_type_error: 'Imagem inválida' }).url('Caminho da imagem inválido').optional().or(z.literal('')),
    email: z.string({ required_error: 'Email é obrigatório', invalid_type_error: 'Email inválido' }).email('Email inválido').optional().or(z.literal('')),
    cpf: z.string({ required_error: 'CPF é obrigatório', invalid_type_error: 'CPF inválido' }).min(11, 'CPF inválido').max(14, 'CPF inválido').optional().or(z.literal('')),
    birthday: z.string({ required_error: 'Data de nascimento é obrigatória', invalid_type_error: 'Data de nascimento inválida' }).optional(),

    // Address
    street: z.string({ required_error: 'Rua é obrigatória', invalid_type_error: 'Rua inválida' }).min(3, 'Rua precisa ter pelo menos 3 caracteres').max(100, 'Rua precisa ter no máximo 100 caracteres'),
    number: z.string({ required_error: 'Número é obrigatório', invalid_type_error: 'Número inválido' }).min(1, 'Endereço: Número minimo 1 caracter'),
    neighborhood: z.string({ required_error: 'Bairro é obrigatório', invalid_type_error: 'Bairro inválido' }).min(3, 'Bairro precisa ter pelo menos 3 caracteres').max(100, 'Bairro precisa ter no máximo 100 caracteres'),
    delivery_tax: z.coerce.number({ required_error: 'Taxa de entrega é obrigatória', invalid_type_error: 'Taxa de entrega inválida' }).min(0, 'Taxa de entrega inválida').optional(),
    complement: z.string({ required_error: 'Complemento é obrigatório', invalid_type_error: 'Complemento inválido' }).max(100, 'Complemento precisa ter no máximo 100 caracteres').optional(),
    reference: z.string({ required_error: 'Referência é obrigatória', invalid_type_error: 'Referência inválida' }).max(100, 'Referência precisa ter no máximo 100 caracteres').optional(),
    city: z.string({ required_error: 'Cidade é obrigatória', invalid_type_error: 'Cidade inválida' }).min(3, 'Cidade precisa ter pelo menos 3 caracteres').max(100, 'Cidade precisa ter no máximo 100 caracteres'),
    uf: z.string({ required_error: 'Estado é obrigatório', invalid_type_error: 'Estado inválido' }).min(2, 'Estado precisa ter pelo menos 2 caracteres').max(2, 'Estado precisa ter no máximo 2 caracteres'),
    cep: z.string({ required_error: 'Cep é obrigatório', invalid_type_error: 'Cep inválido' }).min(8, 'Cep inválido').max(9, 'Cep inválido'),
});

export type ClientFormData = z.infer<typeof SchemaClient>

