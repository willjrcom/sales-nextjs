'use client';

class RequestError {
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

    // Verificar correspondências parciais para mensagens dinâmicas
    for (const [key, translation] of Object.entries(errorTranslations)) {
        if (errorMessage.startsWith(key)) {
            return translation;
        }
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
    "ideal time is required": "O tempo ideal é obrigatório",
    "experimental error is required": "O erro experimental é obrigatório",
    "place position already used by table:": "A posição ja está sendo utilizada por outra mesa",
};

export default RequestError;
export { translateError }