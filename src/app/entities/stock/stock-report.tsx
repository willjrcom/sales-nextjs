import { z } from "zod";
import Decimal from 'decimal.js';
import Stock from "./stock";
import StockAlert from "./stock-alert";

// Tipagem para o resumo do relatório
export interface StockReportSummary {
    total_products: number;
    total_low_stock: number;
    total_out_of_stock: number;
    total_active_alerts: number;
    total_stock_value: Decimal;
}

// Tipagem para o relatório completo
export interface StockReportComplete {
    id: string;
    name: string;
    summary: StockReportSummary;
    all_stocks: Stock[];
    low_stock_products: Stock[];
    out_of_stock_products: Stock[];
    active_alerts: StockAlert[];
    generated_at: string;
}

// Schema de validação para o resumo
const StockReportSummarySchema = z.object({
    total_products: z.number().min(0),
    total_low_stock: z.number().min(0),
    total_out_of_stock: z.number().min(0),
    total_active_alerts: z.number().min(0),
    total_stock_value: z.coerce.number().min(0),
});

// Schema de validação para o relatório completo
const StockReportCompleteSchema = z.object({
    summary: StockReportSummarySchema,
    all_stocks: z.array(z.any()), // Stock já tem sua própria validação
    low_stock_products: z.array(z.any()),
    out_of_stock_products: z.array(z.any()),
    active_alerts: z.array(z.any()), // StockAlert já tem sua própria validação
    generated_at: z.string().datetime(),
});

// Função para validar o relatório completo
export const ValidateStockReport = (report: StockReportComplete) => {
    const validatedFields = StockReportCompleteSchema.safeParse({
        ...report,
        summary: {
            ...report.summary,
            total_stock_value: new Decimal(report.summary.total_stock_value).toNumber(),
        }
    });

    if (!validatedFields.success) {
        return validatedFields.error.flatten().fieldErrors;
    }
    return {};
};

// Função para converter dados da API para a tipagem correta
export const parseStockReportFromAPI = (data: any): StockReportComplete => {
    return {
        id: data.id || "",
        name: data.name || "",
        summary: {
            total_products: data.summary.total_products,
            total_low_stock: data.summary.total_low_stock,
            total_out_of_stock: data.summary.total_out_of_stock,
            total_active_alerts: data.summary.total_active_alerts,
            total_stock_value: new Decimal(data.summary.total_stock_value),
        },
        all_stocks: data.all_stocks.map((stock: any) => new Stock(stock)),
        low_stock_products: data.low_stock_products.map((stock: any) => new Stock(stock)),
        out_of_stock_products: data.out_of_stock_products.map((stock: any) => new Stock(stock)),
        active_alerts: data.active_alerts.map((alert: any) => new StockAlert(alert)),
        generated_at: data.generated_at,
    };
}; 