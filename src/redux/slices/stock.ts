import { StockReportComplete } from '@/app/entities/stock/stock-report';
import { GetAllStocksWithProduct, GetLowStockProducts, GetOutOfStockProducts, GetStockReport } from '@/app/api/stock/stock';
import createGenericSlice, { GenericsProps, GenericState } from './generics';
import { createSlice, createAsyncThunk, createEntityAdapter, PayloadAction, Update } from '@reduxjs/toolkit';
import { Session } from 'next-auth';
import { FormatRefreshTime } from '@/app/components/crud/refresh';
import RequestError from '@/app/utils/error';
import { notifyError } from '@/app/utils/notifications';
import Stock from '@/app/entities/stock/stock';


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

const createReportStocksSlice = ({ name, getItem }: GenericsProps<StockReportComplete>) => {
    const adapter = createEntityAdapter<StockReportComplete, string>({
        // Assume IDs are stored in a field other than `t.id`
        selectId: (t: StockReportComplete) => t.id,
    })

    // Combina o estado inicial do adapter com estados adicionais
    const initialState = adapter.getInitialState<GenericState>({
        loading: false,
        totalCount: 0,
        lastUpdate: FormatRefreshTime(new Date()),
    });

    // Criar o thunk assíncrono para buscar dados
    const fetchReportStocks = createAsyncThunk(`${name}/fetch`, async (payload: { session: Session }, { rejectWithValue }) => {
        try {
            const response = await getItem!(payload.session);
            return { payload: response };
        } catch (error) {
            return rejectWithValue(error);
        }
    });

    // Criar o slice
    const slice = createSlice({
        name,
        initialState,
        reducers: {
            addReportStock: (state, action: PayloadAction<StockReportComplete>) => {
                adapter.addOne(state, action.payload);
            }, // Adiciona um item
            updateReportStock: (state, action: PayloadAction<PayloadAction<Update<StockReportComplete, string>>>) => {
                adapter.updateOne(state, action.payload);
            }, // Atualiza um item
            removeReportStock: (state, action: PayloadAction<string>) => {
                adapter.removeOne(state, action.payload);
            }, // Remove um item
        },
        extraReducers: (builder) => {
            builder
                .addCase(fetchReportStocks.pending, (state) => {
                    state.loading = true;
                })
                .addCase(fetchReportStocks.fulfilled, (state, action) => {
                    state.loading = false;
                    state.lastUpdate = FormatRefreshTime(new Date());
                    adapter.setOne(state, action.payload.payload); // Substitui todos os itens
                })
                .addCase(fetchReportStocks.rejected, (state, action) => {
                    state.loading = false;
                    const err = action.payload as RequestError;
                    notifyError(err.message);
                });
        },
    });

    // Retornar o slice configurado
    return {
        reducer: slice.reducer,
        actions: slice.actions,
        fetchItems: fetchReportStocks,
        adapterSelectors: adapter.getSelectors((state: any) => state[name]), // Seletores do adapter
    };
};

const reportStocksSlice = createReportStocksSlice({ name: 'report-stocks', getItem: GetStockReport })
export const { addReportStock, removeReportStock, updateReportStock } = reportStocksSlice.actions;
export const { fetchItems: fetchReportStocks, adapterSelectors } = reportStocksSlice;
const reportStocksReducer = reportStocksSlice.reducer

export { reportStocksReducer, stocksReducer, lowStocksReducer, outOfStocksReducer }