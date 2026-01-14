import { Session } from "next-auth";
import RequestApi, { AddAccessToken } from "../request";

// Fiscal Invoice
export interface FiscalInvoice {
    id: string;
    company_id: string;
    order_id: string;
    chave_acesso?: string;
    numero: number;
    serie: number;
    status: "pending" | "authorized" | "rejected" | "cancelled";
    xml_path?: string;
    pdf_path?: string;
    protocolo?: string;
    error_message?: string;
    cancellation_reason?: string;
    created_at: string;
}

// Emit NFC-e
export async function emitNFCe(session: Session, orderId: string) {
    const response = await RequestApi<{ order_id: string }, FiscalInvoice>({
        path: "/fiscal/nfce/emitir",
        method: "POST",
        body: { order_id: orderId },
        headers: AddAccessToken(session),
    });

    return response.data;
}

// Query invoice
export async function queryInvoice(session: Session, invoiceId: string) {
    const response = await RequestApi<null, FiscalInvoice>({
        path: `/fiscal/nfce/${invoiceId}`,
        method: "GET",
        headers: AddAccessToken(session),
    });

    return response.data;
}

// List invoices
export async function listInvoices(
    session: Session,
    page = 1,
    perPage = 10,
) {
    const response = await RequestApi<null, FiscalInvoice[]>({
        path: `/fiscal/nfce?page=${page}&per_page=${perPage}`,
        method: "GET",
        headers: AddAccessToken(session),
    });

    const items = response.data;
    const totalHeader = response.headers.get("x-total-count");
    const totalCount = totalHeader ? parseInt(totalHeader, 10) : items.length;

    return { items, totalCount };
}

// Cancel invoice
export async function cancelInvoice(
    session: Session,
    invoiceId: string,
    justificativa: string,
) {
    const response = await RequestApi<{ justificativa: string }, { message: string }>({
        path: `/fiscal/nfce/${invoiceId}/cancelar`,
        method: "POST",
        body: { justificativa },
        headers: AddAccessToken(session),
    });

    return response.data;
}
