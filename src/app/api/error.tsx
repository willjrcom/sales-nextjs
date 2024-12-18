'use client';

export default class RequestError {
    message: string = "";
    status: number = 0;
    path: string = "";

    constructor(message?: string, status?: number, path?: string) {
        this.message = message || "";
        this.status = status || 0;
        this.path = path || "";
    };
}

const translateError = (errorMessage: string): string => {
    if (errorTranslations[errorMessage]) {
        return errorTranslations[errorMessage];
    }
    // Tradução genérica
    if (errorMessage.includes("not found")) return "Recurso não encontrado";
    if (errorMessage.includes("Invalid")) return "Entrada inválida";
    if (errorMessage.includes("denied")) return "Permissão negada";

    return errorMessage;
};

const errorTranslations: Record<string, string> = {
    "sql: no rows in result set": "Nenhum resultado encontrado",
    "order paid less than total": "O total pago deve ser maior que o total do pedido",
    "group item not staging": "Esse item já foi enviado para produção, por favor, adicione um novo grupo de itens.",
    "total paid is invalid": "O total pago deve ser maior que 0",
    "order delivery must be delivered": "A entrega do pedido deve estar entregue",
};


export { translateError }