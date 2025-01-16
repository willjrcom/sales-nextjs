import { GenericsProps, GenericState } from './generics';
import { createSlice, createAsyncThunk, createEntityAdapter, PayloadAction, Update } from '@reduxjs/toolkit';
import { Session } from 'next-auth';
import { FormatRefreshTime } from '@/app/components/crud/refresh';
import RequestError from '@/app/api/error';
import Order from '@/app/entities/order/order';
import GetOrders from '@/app/api/order/order';

// Configuração genérica do slice
const createOrdersSlice = ({ name, getItems }: GenericsProps<Order>) => {
    const adapter = createEntityAdapter<Order, string>({
        // Assume IDs are stored in a field other than `t.id`
        selectId: (t: Order) => t.id,
        // Keep the "all IDs" array sorted based on t order_number
        sortComparer: (a, b) => a.order_number - b.order_number,
    })

    // Combina o estado inicial do adapter com estados adicionais
    const initialState = adapter.getInitialState<GenericState>({
        loading: false,
        error: null,
        lastUpdate: FormatRefreshTime(new Date()),
    });

    // Criar o thunk assíncrono para buscar dados
    const fetchOrders = createAsyncThunk(`${name}/fetch`, async (session: Session, { rejectWithValue }) => {
        try {
            const items = await getItems!(session);
            return items;
        } catch (error) {
            return rejectWithValue(error);
        }
    });

    // Criar o slice
    const slice = createSlice({
        name,
        initialState,
        reducers: {
            addOrder: (state, action: PayloadAction<Order>) => {
                adapter.addOne(state, action.payload);
            }, // Adiciona um item
            updateOrder: (state, action: PayloadAction<Update<Order, string>>) => {
                adapter.updateOne(state, action.payload);
            }, // Atualiza um item
            removeOrder: (state, action: PayloadAction<string>) => {
                adapter.removeOne(state, action.payload);
            }, // Remove um item
        },
        extraReducers: (builder) => {
            builder
                .addCase(fetchOrders.pending, (state) => {
                    state.loading = true;
                })
                .addCase(fetchOrders.fulfilled, (state, action) => {
                    state.loading = false;
                    state.error = null;
                    adapter.setAll(state, action.payload); // Substitui todos os itens
                    state.lastUpdate = FormatRefreshTime(new Date());
                })
                .addCase(fetchOrders.rejected, (state, action) => {
                    state.loading = false;
                    state.error = action.payload as RequestError;
                });
        },
    });

    // Retornar o slice configurado
    return {
        reducer: slice.reducer,
        actions: slice.actions,
        fetchItems: fetchOrders,
        adapterSelectors: adapter.getSelectors((state: any) => state[name]), // Seletores do adapter
    };
};

const orderSlice = createOrdersSlice({ name: 'orders', getItems: GetOrders })
export const { addOrder, removeOrder, updateOrder } = orderSlice.actions;
export const { fetchItems: fetchOrders, adapterSelectors } = orderSlice;
export default orderSlice.reducer;
