import { UUID } from "crypto";

export type Address = {
    id: string;
    object_id: UUID;
    street: string;
    number: string;
    complement: string;
    reference: string;
    neighborhood: string;
    city: string;
    state: string;
    cep: string;
    delivery_tax: number;
};
