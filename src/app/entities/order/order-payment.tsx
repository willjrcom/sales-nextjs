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
    id: string = "";
    total_paid: Decimal = new Decimal(0);
    method: PayMethod = "Dinheiro";
    order_id: string = "";

    constructor(id = "", total_paid: Decimal = new Decimal(0), method: PayMethod = "Dinheiro", order_id = "") {
        this.id = id;
        this.total_paid = total_paid;
        this.method = method;
        this.order_id = order_id;
    }
}

const SchemaPayment = z.object({
    total_paid: z.coerce.number().nonnegative("Total inválido"),
    method: z.enum(payMethods).refine((value) => value !== undefined, "Método inválido"),
    order_id: z.string().uuid("Categoria inválida"),
});

export const ValidatePaymentForm = (payment: PaymentOrder) => {
    const validatedFields = SchemaPayment.safeParse({
        total_paid: payment.total_paid.toNumber(),
        method: payment.method,
        order_id: payment.order_id,
    });

    if (!validatedFields.success) {
        // Usa o método flatten para simplificar os erros
        return validatedFields.error.flatten().fieldErrors;
    } 
    return {}
};