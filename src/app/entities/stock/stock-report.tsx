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