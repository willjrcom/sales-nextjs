import Stock from '@/app/entities/stock/stock';
import { StockReportComplete } from '@/app/entities/stock/stock-report';
import { GetAllStocksWithProduct, GetLowStockProducts, GetOutOfStockProducts, GetStockReport } from '@/app/api/stock/stock';
import createGenericSlice from './generics';

const StocksSlice = createGenericSlice<Stock>({ name: 'stocks', getItems: GetAllStocksWithProduct })
export const { addItem: addStock, removeItem: removeStock, updateItem: updateStock } = StocksSlice.actions;
export const { fetchItems: fetchStocks } = StocksSlice;
const stocksReducer = StocksSlice.reducer;

const LowStocksSlice = createGenericSlice<Stock>({ name: 'low-stocks', getItems: GetLowStockProducts })
export const { addItem: addLowStock, removeItem: removeLowStock, updateItem: updateLowStock } = LowStocksSlice.actions;
export const { fetchItems: fetchLowStocks } = LowStocksSlice;
const lowStocksReducer = LowStocksSlice.reducer;

const OutOfStocksSlice = createGenericSlice<Stock>({ name: 'out-of-stocks', getItems: GetOutOfStockProducts })
export const { addItem: addOutOfStock, removeItem: removeOutOfStock, updateItem: updateOutOfStock } = OutOfStocksSlice.actions;
export const { fetchItems: fetchOutOfStocks } = OutOfStocksSlice;
const outOfStocksReducer = OutOfStocksSlice.reducer;

const ReportStocksSlice = createGenericSlice<StockReportComplete>({ name: 'report-stocks', getItems: GetStockReport })
export const { addItem: addReportStock, removeItem: removeReportStock, updateItem: updateReportStock } = ReportStocksSlice.actions;
export const { fetchItems: fetchReportStocks } = ReportStocksSlice;
const ReportStocksReducer = ReportStocksSlice.reducer;

export { stocksReducer, lowStocksReducer, outOfStocksReducer, ReportStocksReducer }