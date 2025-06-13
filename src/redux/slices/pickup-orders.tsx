import { FetchItemsArgs, GenericsProps, GenericState } from './generics';
import { createSlice, createAsyncThunk, createEntityAdapter, PayloadAction, Update } from '@reduxjs/toolkit';
import { FormatRefreshTime } from '@/app/components/crud/refresh';
import RequestError from '@/app/utils/error';
import Order from '@/app/entities/order/order';
import GetOrdersWithPickup from '@/app/api/order/all/pickup/order';
import { notifyError } from '@/app/utils/notifications';

// Configuração genérica do slice
const createPickupOrdersSlice = ({ name, getItems }: GenericsProps<Order>) => {
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
    const fetchPickupOrders = createAsyncThunk(`${name}/fetch`, async ({session, page, perPage}: FetchItemsArgs, { rejectWithValue }) => {
        try {
            const response = await getItems!(session, page, perPage);
            return {payload: response.items, totalCount: Number(response.headers.get("X-Total-Count"))};
        } catch (error) {
            return rejectWithValue(error);
        }
    });

    // Criar o slice
    const slice = createSlice({
        name,
        initialState,
        reducers: {
            addPickupOrder: (state, action: PayloadAction<Order>) => {
                adapter.addOne(state, action.payload);
            }, // Adiciona um item
            updatePickupOrder: (state, action: PayloadAction<Update<Order, string>>) => {
                adapter.updateOne(state, action.payload);
            }, // Atualiza um item
            removePickupOrder: (state, action: PayloadAction<string>) => {
                adapter.removeOne(state, action.payload);
            }, // Remove um item
        },
        extraReducers: (builder) => {
            builder
                .addCase(fetchPickupOrders.pending, (state) => {
                    state.loading = true;
                })
                .addCase(fetchPickupOrders.fulfilled, (state, action) => {
                    state.loading = false;
                    state.lastUpdate = FormatRefreshTime(new Date());
                    adapter.setAll(state, action.payload.payload); // Substitui todos os itens
                })
                .addCase(fetchPickupOrders.rejected, (state, action) => {
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
        fetchItems: fetchPickupOrders,
        adapterSelectors: adapter.getSelectors((state: any) => state[name]), // Seletores do adapter
    };
};

const pickupOrdersSlice = createPickupOrdersSlice({ name: 'pickup-orders', getItems: GetOrdersWithPickup })
export const { addPickupOrder, removePickupOrder, updatePickupOrder } = pickupOrdersSlice.actions;
export const { fetchItems: fetchPickupOrders, adapterSelectors } = pickupOrdersSlice;
export default pickupOrdersSlice.reducer;
