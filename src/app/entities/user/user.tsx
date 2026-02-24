import { z } from "zod";
import Company from "../company/company";
import Person from "../person/person";
import { ContactType } from "../contact/contact";

export default class User extends Person {
    id: string = '';
    companies: Company[] = [];

    constructor(data: Partial<User> = {}) {
        super();
        Object.assign(this, data);
    }
};


export const SchemaUser = z.object({
    name: z.string().min(3, 'Nome precisa ter pelo menos 3 caracteres').max(100, 'Nome precisa ter no máximo 100 caracteres'),
    email: z.string().email('Email inválido'),
    cpf: z.string().min(11, 'CPF precisa ter pelo menos 11 caracteres').max(14, 'CPF precisa ter no máximo 14 caracteres'),
    birthday: z.string().min(10, 'Data de nascimento é obrigatória'),
    contact: z.string().min(9, 'Celular: Número inválido').max(15, 'Celular: Número inválido'),
    cep: z.string().min(8, 'Cep inválido').max(9, 'Cep inválido'),
    street: z.string().min(3, 'Rua precisa ter pelo menos 3 caracteres').max(100, 'Rua precisa ter no máximo 100 caracteres'),
    number: z.string().min(1, 'Endereço: Número minimo 1 caracter'),
    neighborhood: z.string().min(3, 'Bairro precisa ter pelo menos 3 caracteres').max(100, 'Bairro precisa ter no máximo 100 caracteres'),
    complement: z.string().optional(),
    reference: z.string().optional(),
    city: z.string().min(3, 'Cidade precisa ter pelo menos 3 caracteres').max(100, 'Cidade precisa ter no máximo 100 caracteres').optional(),
    uf: z.string().min(2, 'Estado precisa ter pelo menos 2 caracteres').max(2, 'Estado precisa ter no máximo 2 caracteres').optional(),
    image_path: z.string().optional(),
});

export type UserFormData = z.infer<typeof SchemaUser>;

export const SchemaUserCreate = z.object({
    name: z.string().min(3, 'Nome precisa ter pelo menos 3 caracteres').max(100, 'Nome precisa ter no máximo 100 caracteres'),
    email: z.string().email('Email inválido'),
    cpf: z.string().min(11, 'CPF precisa ter pelo menos 11 caracteres').max(14, 'CPF precisa ter no máximo 14 caracteres'),
});

export const SchemaSignUp = SchemaUserCreate.extend({
    password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres'),
    confirmPassword: z.string().min(8, 'A confirmação de senha deve ter pelo menos 8 caracteres'),
}).refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não conferem",
    path: ["confirmPassword"],
});

export type SignUpFormData = z.infer<typeof SchemaSignUp>;
