import { z } from "zod";
import Decimal from 'decimal.js';

export type PayMethod = "Dinheiro" | "Visa" | "MasterCard" | "Ticket" | "VR" | "American Express" | "Elo" | "Diners Club" | "Hipercard" | "Visa Electron" | "Maestro" | "Alelo" | "PayPal" | "Outros";

export const payMethods = [
    "Dinheiro",
    "Visa",
    "MasterCard",
    "Ticket",
    "VR",
    "American Express",
    "Elo",
    "Diners Club",
    "Hipercard",
    "Visa Electron",
    "Maestro",
    "Alelo",
    "PayPal",
    "Outros",
] as const; // "as const" torna o array literal readonly e compatível com z.enum
// Converte para o formato { id: string; name: string }[]

export const payMethodsWithId: { id: string; name: string }[] = Array.from(payMethods, (method) => ({
    id: method,
    name: method,
}));

export class PaymentOrder {
    id: string = '';
    total_paid: Decimal = new Decimal(0);
    method: PayMethod = "Dinheiro";
    order_id: string = '';
    order_number: number = 0;


    constructor(data: Partial<PaymentOrder> = {}) {
        Object.assign(this, data);
    }
}

export const SchemaPayment = z.object({
    total_paid: z.coerce.number().positive("Total precisa ser maior que zero"),
    method: z.enum(payMethods).refine((value) => value !== undefined, "Método inválido"),
    order_id: z.string().uuid("Categoria inválida"),
});

export type PaymentFormData = z.infer<typeof SchemaPayment>;
