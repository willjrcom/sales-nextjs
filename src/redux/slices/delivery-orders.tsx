import { FetchItemsArgs, GenericsProps, GenericState } from './generics';
import { createSlice, createAsyncThunk, createEntityAdapter, PayloadAction, Update } from '@reduxjs/toolkit';
import { Session } from 'next-auth';
import { FormatRefreshTime } from '@/app/components/crud/refresh';
import RequestError from '@/app/utils/error';
import Order from '@/app/entities/order/order';
import GetOrdersWithDelivery from '@/app/api/order/all/delivery/order';
import { notifyError } from '@/app/utils/notifications';

// Configuração genérica do slice
const createDeliveryOrdersSlice = ({ name, getItems }: GenericsProps<Order>) => {
    const adapter = createEntityAdapter<Order, string>({
        // Assume IDs are stored in a field other than `t.id`
        selectId: (t: Order) => t.id,
        // Keep the "all IDs" array sorted based on t order_number
        sortComparer: (a, b) => a.order_number - b.order_number,
    })

    // Combina o estado inicial do adapter com estados adicionais
    const initialState = adapter.getInitialState<GenericState>({
        loading: false,
        totalCount: 0,
        lastUpdate: FormatRefreshTime(new Date()),
    });

    // Criar o thunk assíncrono para buscar dados
    const fetchDeliveryOrders = createAsyncThunk(`${name}/fetch`, async ({session, page, perPage}: FetchItemsArgs, { rejectWithValue }) => {
        try {
            const response = await getItems!(session, page, perPage);
            return {payload: response.items, totalCount: Number(response.headers.get("X-Total-Count")) || 0};
        } catch (error) {
            return rejectWithValue(error);
        }
    });

    // Criar o slice
    const slice = createSlice({
        name,
        initialState,
        reducers: {
            addDeliveryOrder: (state, action: PayloadAction<Order>) => {
                adapter.addOne(state, action.payload);
            }, // Adiciona um item
            updateDeliveryOrder: (state, action: PayloadAction<Update<Order, string>>) => {
                adapter.updateOne(state, action.payload);
            }, // Atualiza um item
            removeDeliveryOrder: (state, action: PayloadAction<string>) => {
                adapter.removeOne(state, action.payload);
            }, // Remove um item
        },
        extraReducers: (builder) => {
            builder
                .addCase(fetchDeliveryOrders.pending, (state) => {
                    state.loading = true;
                })
                .addCase(fetchDeliveryOrders.fulfilled, (state, action) => {
                    state.loading = false;
                    state.lastUpdate = FormatRefreshTime(new Date());
                    adapter.setAll(state, action.payload.payload); // Substitui todos os itens
                })
                .addCase(fetchDeliveryOrders.rejected, (state, action) => {
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
        fetchItems: fetchDeliveryOrders,
        adapterSelectors: adapter.getSelectors((state: any) => state[name]), // Seletores do adapter
    };
};

const deliveryOrdersSlice = createDeliveryOrdersSlice({ name: 'delivery-orders', getItems: GetOrdersWithDelivery })
export const { addDeliveryOrder, removeDeliveryOrder, updateDeliveryOrder } = deliveryOrdersSlice.actions;
export const { fetchItems: fetchDeliveryOrders, adapterSelectors } = deliveryOrdersSlice;
export default deliveryOrdersSlice.reducer;
