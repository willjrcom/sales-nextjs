import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Session } from 'next-auth';
import Stock from '@/app/entities/stock/stock';
import { GetAllStocksWithProduct, GetLowStockProducts, GetOutOfStockProducts, GetStockReport } from '@/app/api/stock/stock';
import RequestError from '@/app/utils/error';

interface StockState {
    entities: Record<string, Stock>;
    lowStock: Record<string, Stock>;
    outOfStock: Record<string, Stock>;
    report: any;
    loading: boolean;
    error: string | null;
}

const initialState: StockState = {
    entities: {},
    lowStock: {},
    outOfStock: {},
    report: null,
    loading: false,
    error: null,
};

export const fetchStocks = createAsyncThunk(
    'stock/fetchStocks',
    async ({ session }: { session: Session }, { rejectWithValue }) => {
        try {
            const stocks = await GetAllStocksWithProduct(session);
            return stocks;
        } catch (error) {
            const err = error as RequestError;
            return rejectWithValue(err.message || 'Erro ao carregar estoques');
        }
    }
);

export const fetchLowStock = createAsyncThunk(
    'stock/fetchLowStock',
    async ({ session }: { session: Session }, { rejectWithValue }) => {
        try {
            const stocks = await GetLowStockProducts(session);
            return stocks;
        } catch (error) {
            const err = error as RequestError;
            return rejectWithValue(err.message || 'Erro ao carregar estoques baixos');
        }
    }
);

export const fetchOutOfStock = createAsyncThunk(
    'stock/fetchOutOfStock',
    async ({ session }: { session: Session }, { rejectWithValue }) => {
        try {
            const stocks = await GetOutOfStockProducts(session);
            return stocks;
        } catch (error) {
            const err = error as RequestError;
            return rejectWithValue(err.message || 'Erro ao carregar produtos sem estoque');
        }
    }
);

export const fetchStockReport = createAsyncThunk(
    'stock/fetchStockReport',
    async ({ session }: { session: Session }, { rejectWithValue }) => {
        try {
            const report = await GetStockReport(session);
            return report;
        } catch (error) {
            const err = error as RequestError;
            return rejectWithValue(err.message || 'Erro ao carregar relatório de estoque');
        }
    }
);

const stockSlice = createSlice({
    name: 'stock',
    initialState,
    reducers: {
        updateStock: (state, action: PayloadAction<{ type: 'UPDATE' | 'ADD' | 'REMOVE', payload: { id: string, changes?: Partial<Stock> } }>) => {
            const { type, payload } = action.payload;
            
            switch (type) {
                case 'UPDATE':
                    if (state.entities[payload.id] && payload.changes) {
                        state.entities[payload.id] = { ...state.entities[payload.id], ...payload.changes };
                    }
                    break;
                case 'ADD':
                    if (payload.changes) {
                        state.entities[payload.id] = payload.changes as Stock;
                    }
                    break;
                case 'REMOVE':
                    delete state.entities[payload.id];
                    break;
            }
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // fetchStocks
            .addCase(fetchStocks.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchStocks.fulfilled, (state, action) => {
                state.loading = false;
                const stocks = Array.isArray(action.payload) ? action.payload : [];
                state.entities = stocks.reduce((acc, stock) => {
                    acc[stock.id] = stock;
                    return acc;
                }, {} as Record<string, Stock>);
            })
            .addCase(fetchStocks.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // fetchLowStock
            .addCase(fetchLowStock.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchLowStock.fulfilled, (state, action) => {
                state.loading = false;
                const lowStock = Array.isArray(action.payload) ? action.payload : [];
                state.lowStock = lowStock.reduce((acc, stock) => {
                    acc[stock.id] = stock;
                    return acc;
                }, {} as Record<string, Stock>);
            })
            .addCase(fetchLowStock.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // fetchOutOfStock
            .addCase(fetchOutOfStock.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchOutOfStock.fulfilled, (state, action) => {
                state.loading = false;
                const outOfStock = Array.isArray(action.payload) ? action.payload : [];
                state.outOfStock = outOfStock.reduce((acc, stock) => {
                    acc[stock.id] = stock;
                    return acc;
                }, {} as Record<string, Stock>);
            })
            .addCase(fetchOutOfStock.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // fetchStockReport
            .addCase(fetchStockReport.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchStockReport.fulfilled, (state, action) => {
                state.loading = false;
                state.report = action.payload;
            })
            .addCase(fetchStockReport.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { updateStock, clearError } = stockSlice.actions;
export default stockSlice.reducer; 