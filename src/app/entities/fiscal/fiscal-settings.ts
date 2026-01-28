export interface FiscalSettingsDTO {
    company_registry_id?: number;
    fiscal_enabled: boolean;
    state_registration?: string;
    tax_regime: number;
    cnae?: string;
    crt?: number;
    is_simple_national: boolean;
    municipal_registration?: string;
    show_tax_breakdown: boolean;
    send_email_to_recipient: boolean;
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
    company_registry_id?: number;
    fiscal_enabled?: boolean;
    state_registration?: string;
    tax_regime?: number;
    is_simple_national?: boolean;
    cnae?: string;
    crt?: number;
    municipal_registration?: string;
    show_tax_breakdown?: boolean;
    send_email_to_recipient?: boolean;
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
