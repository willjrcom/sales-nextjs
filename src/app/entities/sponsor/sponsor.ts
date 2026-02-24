import { z } from "zod";
import { SchemaAddress } from "../address/address";
import Address from "../address/address";

export interface Sponsor {
    id: string
    name: string
    cnpj: string
    email?: string
    contact?: string
    address?: Address
}

export const SchemaSponsor = z.object({
    name: z.string().min(1, 'Nome é obrigatório'),
    cnpj: z.string().min(1, 'CNPJ é obrigatório'),
    email: z.string().email('Email inválido').optional().or(z.literal('')),
    contact: z.string().optional().or(z.literal('')),
    address: SchemaAddress.optional(),
});

export type SponsorFormData = z.infer<typeof SchemaSponsor>;
