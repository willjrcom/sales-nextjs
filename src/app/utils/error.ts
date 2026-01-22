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

    return errorMessage;
};

const errorTranslations: Record<string, string> = {
    // Erros de sistema gerais
    "must open a new shift": "Um novo turno deve ser aberto",
    "user must be an employee": "O usuário deve se cadastrar como um funcionário",
    "sql: no rows in result set": "Nenhum resultado encontrado",
    "internal server error": "Erro interno do servidor",
    "header content-type is different from application/json": "Content-Type deve ser application/json",
    "id is required": "ID é obrigatório",
    "schema not found in token": "Schema não encontrado no token",
    "context user not found": "Usuário não encontrado no contexto",
    "invalid email or password": "Email ou senha inválidos",
    "access-token is required": "Access token é obrigatório",
    "id-token is required": "ID token é obrigatório",
    "email do token invalido!": "Email do token inválido",

    // Erros de Pedido (Order)
    "order must have at least one item": "O pedido deve ter pelo menos um item",
    "order must be pending": "O pedido deve estar pendente",
    "order must be pending or ready": "O pedido deve estar pendente ou pronto",
    "order must be canceled": "O pedido deve estar cancelado",
    "order must be archived": "O pedido deve estar arquivado",
    "order already finished": "O pedido já foi finalizado",
    "order already canceled": "O pedido já foi cancelado",
    "order already archived": "O pedido já foi arquivado",
    "order paid more than total": "O valor pago excede o total do pedido",
    "order paid less than total": "O total pago deve ser maior que o total do pedido",
    "order delivery must be delivered": "A entrega do pedido deve estar entregue",
    "order table must be closed": "A mesa do pedido deve estar fechada",
    "order pickup must be ready": "O pedido para retirada deve estar pronto",
    "order pickup must be delivered": "O pedido para retirada deve estar entregue",
    "order delivery must be pending": "A entrega do pedido deve estar pendente",
    "order delivery must be ready": "A entrega do pedido deve estar pronta",
    "order delivery must be shipped": "A entrega do pedido deve estar enviada",
    "order pickup must be pending": "O pedido para retirada deve estar pendente",
    "total paid is invalid": "O total pago deve ser maior que 0",
    "group item category invalid": "Categoria inválida para esse grupo de itens",
    "start at must be before now": "A data de início deve ser anterior à data atual",

    // Erros de Grupo de Itens (Group Item)
    "group item not staging": "Esse item já foi enviado para produção, por favor, adicione um novo grupo de itens.",
    "quantity items in group is not integer": "A quantidade de itens no grupo deve ser um número inteiro",
    "group not staging": "O grupo não está em estágio",
    "group not pending": "O grupo não está pendente",
    "group not started": "O grupo não foi iniciado",
    "group not ready": "O grupo não está pronto",
    "group not staging or pending": "O grupo deve estar em estágio ou pendente",
    "no items in group": "Não há itens no grupo",
    "items already finished": "Os itens já foram finalizados",
    "size must be the same": "O tamanho deve ser o mesmo",
    "complement item already added": "Item complementar já foi adicionado",
    "complement item not found": "Item complementar não encontrado",
    "complement category does not belong to this category": "A categoria complementar não pertence a esta categoria",

    // Erros de Item
    "item not pending": "O item não está pendente",
    "item not started": "O item não foi iniciado",
    "item not ready": "O item não está pronto",
    "only cancel allowed": "Apenas cancelamento é permitido",

    // Erros de Processo (Process)
    "process must be started": "O processo deve ser iniciado",
    "reason is required": "A razão é obrigatória",
    "process already started": "O processo já foi iniciado",
    "employee not found": "Funcionário não encontrado",
    "process paused, must be continue to finish": "Processo pausado, deve ser continuado para finalizar",
    "process already finished": "O processo já foi finalizado",
    "process already paused": "O processo já está pausado",
    "process must be paused": "O processo deve estar pausado",
    "process already continued": "O processo já foi continuado",

    // Erros de Usuário
    "user already exists": "Usuário já cadastrado",
    "invalid email": "Email inválido",
    "invalid password": "Senha inválida",
    "email cannot be empty": "Email não pode estar vazio",
    "user not found": "Usuário não encontrado",
    "invalid user": "Usuário inválido",
    "email and cpf cannot both be empty": "Email e CPF não podem estar vazios simultaneamente",
    "invalid id": "ID inválido",

    // Erros de Cliente/Contato
    "contact already exists": "Contato já cadastrado",
    "contact not found": "Contato não encontrado",
    "invalid contact": "Contato inválido",
    "ddd and number are required": "DDD e número são obrigatórios",
    "contact format invalid": "Formato de contato inválido",

    // Erros de Endereço
    "address already exists": "Endereço já cadastrado",
    "address not found": "Endereço não encontrado",
    "invalid address": "Endereço inválido",

    // Erros de Empresa (Company)
    "user already added to company": "Usuário já foi adicionado à empresa",
    "user already removed from company": "Usuário já foi removido da empresa",
    "company already exists": "Empresa já cadastrado",
    "company not found": "Empresa não encontrada",
    "invalid company": "Empresa inválida",
    "no company found": "Nenhuma empresa encontrada",
    "invalid userID": "ID de usuário inválido",
    "inscricao_estadual is required to enable fiscal invoices": "Inscrição estadual é obrigatoria",

    // Erros de Cliente
    "client already exists": "Cliente já cadastrado",
    "client not found": "Cliente não encontrado",
    "invalid client": "Cliente inválido",

    // Erros de Produto
    "code product already exists": "Código do produto já cadastrado",
    "product category not found": "Categoria do produto não encontrada",
    "size is invalid": "Tamanho inválido",
    "size not found": "Tamanho não encontrado",
    "size is used in products": "O tamanho está sendo usado em produtos",
    "size already exists": "Tamanho já existe",
    "quantity already exists": "Quantidade já existe",

    // Erros de Local/Posição
    "place position already used by table:": "A posição já está sendo utilizada por outra mesa",
    "error to search used table": "Erro ao buscar mesa utilizada",

    // Erros de Estoque (Stock)
    "insufficient stock": "Estoque insuficiente",
    "stock movement is required": "Movimento de estoque é obrigatório",
    "invalid quantity": "Quantidade inválida",
    "product not found": "Produto não encontrado",
    "stock control is not active": "Controle de estoque não está ativo",

    // Erros de Pedido - Tabela (Order Table)
    "name is required": "Nome é obrigatório",

    // Erros de Process Rule
    "ideal time is required": "O tempo ideal é obrigatório",
    "experimental error is required": "O erro experimental é obrigatório",

    // Erros de Funcionário
    "employee already exists": "Funcionário já existe",

    // Erros de Pedido - Entregas
    "order not found": "Pedido não encontrado",
    "delivery not found": "Entrega não encontrada",
    "table not found": "Mesa não encontrada",

    // Erros de Cupom
    "discount must be positive": "O desconto deve ser positivo",
    "start_at and end_at are required": "Data de início e fim são obrigatórias",
    "start_at must be before end_at": "Data de início deve ser anterior à data de fim",

    // Erros de Preferências da Empresa
    "preference": "Preferência",

};

export default RequestError;
export { translateError }