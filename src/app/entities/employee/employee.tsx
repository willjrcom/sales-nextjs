import { z } from "zod";
import User from "../user/user";
import { ContactType } from "../contact/contact";

export default class Employee extends User {
    id: string = '';
    user_id: string = '';
    is_active: boolean = true;
    permissions: Record<string, boolean> = {};

    constructor(data: Partial<Employee> = {}) {
        super();
        Object.assign(this, data);
    }

    setPermission(key: string, value: boolean) {
        this.permissions[key] = value;
    }

    getPermission(key: string): boolean {
        return !!this.permissions[key];
    }
};

export const SchemaEmployee = z.object({
    name: z.string().min(3, 'Nome precisa ter pelo menos 3 caracteres').max(100, 'Nome precisa ter no máximo 100 caracteres'),
    email: z.string().email('Email inválido'),
    cpf: z.string().min(11, 'CPF precisa ter pelo menos 11 caracteres').max(14, 'CPF precisa ter no máximo 14 caracteres'),
    birthday: z.string().optional().or(z.literal('')),
    contact: z.string().min(9, 'Celular: Número inválido').max(15, 'Celular: Número inválido').or(z.literal('')),
    cep: z.string().min(8, 'Cep inválido').max(9, 'Cep inválido').optional().or(z.literal('')),
    street: z.string().min(3, 'Rua precisa ter pelo menos 3 caracteres').max(100, 'Rua precisa ter no máximo 100 caracteres'),
    number: z.string().min(1, 'Endereço: Número minimo 1 caracter'),
    neighborhood: z.string().min(3, 'Bairro precisa ter pelo menos 3 caracteres').max(100, 'Bairro precisa ter no máximo 100 caracteres'),
    city: z.string().min(3, 'Cidade precisa ter pelo menos 3 caracteres').max(100, 'Cidade precisa ter no máximo 100 caracteres').optional(),
    uf: z.string().min(2, 'Estado precisa ter pelo menos 2 caracteres').max(2, 'Estado precisa ter no máximo 2 caracteres').optional(),
    is_active: z.boolean().optional(),
});
