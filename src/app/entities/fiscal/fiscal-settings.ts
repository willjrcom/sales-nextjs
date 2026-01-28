export interface FiscalSettingsDTO {
    fiscal_enabled: boolean;
    inscricao_estadual?: string;
    regime_tributario: number;
    cnae?: string;
    crt?: number;
    simples_nacional: boolean;
    inscricao_municipal?: string;
    discrimina_impostos: boolean;
    enviar_email_destinatario: boolean;
    business_name: string;
    trade_name?: string;
    cnpj: string;
    email: string;
    phone?: string;
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    uf: string;
    cep: string;
}

export interface FiscalSettingsUpdateDTO {
    fiscal_enabled?: boolean;
    inscricao_estadual?: string;
    regime_tributario?: number;
    simples_nacional?: boolean;
    cnae?: string;
    crt?: number;
    inscricao_municipal?: string;
    discrimina_impostos?: boolean;
    enviar_email_destinatario?: boolean;
    business_name?: string;
    trade_name?: string;
    cnpj?: string;
    email?: string;
    phone?: string;
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    uf?: string;
    cep?: string;
}
