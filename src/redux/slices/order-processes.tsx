import { GenericsProps, GenericState } from './generics';
import { createSlice, createAsyncThunk, createEntityAdapter, PayloadAction, Update } from '@reduxjs/toolkit';
import { Session } from 'next-auth';
import { FormatRefreshTime } from '@/app/components/crud/refresh';
import RequestError from '@/app/utils/error';
import OrderProcess from '@/app/entities/order-process/order-process';
import GetProcessesByProcessRuleID from '@/app/api/order-process/by-process-rule/order-process';
import { notifyError } from '@/app/utils/notifications';

const createOrderProcessesSlice = ({ name, getItemsByID }: GenericsProps<OrderProcess>) => {
    const adapter = createEntityAdapter<OrderProcess, string>({
        // Assume IDs are stored in a field other than `t.id`
        selectId: (t: OrderProcess) => t.id,
        // Keep the "all IDs" array sorted based on t order_number
        sortComparer: (a, b) => a.status === "Started" ? -1 : 1,
    })

    // Combina o estado inicial do adapter com estados adicionais
    const initialState = adapter.getInitialState<GenericState>({
        loading: false,
        totalCount: 0,
        lastUpdate: FormatRefreshTime(new Date()),
    });

    // Criar o thunk assíncrono para buscar dados
    const fetchOrderProcesses = createAsyncThunk(`${name}/fetch`, async (payload: { id: string; session: Session }, { rejectWithValue }) => {
        try {
            const response = await getItemsByID!(payload.id, payload.session);
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
            addOrderProcess: (state, action: PayloadAction<OrderProcess>) => {
                adapter.addOne(state, action.payload);
            }, // Adiciona um item
            updateOrderProcess: (state, action: PayloadAction<PayloadAction<Update<OrderProcess, string>>>) => {
                adapter.updateOne(state, action.payload);
            }, // Atualiza um item
            removeOrderProcess: (state, action: PayloadAction<string>) => {
                adapter.removeOne(state, action.payload);
            }, // Remove um item
        },
        extraReducers: (builder) => {
            builder
                .addCase(fetchOrderProcesses.pending, (state) => {
                    state.loading = true;
                })
                .addCase(fetchOrderProcesses.fulfilled, (state, action) => {
                    state.loading = false;
                    state.lastUpdate = FormatRefreshTime(new Date());
                    adapter.setAll(state, action.payload.payload); // Substitui todos os itens
                })
                .addCase(fetchOrderProcesses.rejected, (state, action) => {
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
        fetchItems: fetchOrderProcesses,
        adapterSelectors: adapter.getSelectors((state: any) => state[name]), // Seletores do adapter
    };
};

const orderProcessSlice = createOrderProcessesSlice({ name: 'delivery-orders', getItemsByID: GetProcessesByProcessRuleID })
export const { addOrderProcess, removeOrderProcess, updateOrderProcess } = orderProcessSlice.actions;
export const { fetchItems: fetchOrderProcesses, adapterSelectors } = orderProcessSlice;
export default orderProcessSlice.reducer;
