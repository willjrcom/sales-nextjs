import { createSlice, createAsyncThunk, createEntityAdapter, EntityState, PayloadAction, Update } from '@reduxjs/toolkit';
import { Session } from 'next-auth';
import { FormatRefreshTime } from '@/app/components/crud/refresh';
import RequestError from '@/app/api/error';

// Estado genérico adicional
export interface GenericState {
    loading: boolean;
    error: RequestError | null;
    lastUpdate: string;
}

export interface GenericsProps<T> {
    name: string;
    getItems: (session: Session) => Promise<T[]>;
}

// Configuração genérica do slice
const createGenericSlice = <T extends { name?: any; id: string }>({ name, getItems }: GenericsProps<T>) => {
    const adapter = createEntityAdapter<T, string>({
        // Assume IDs are stored in a field other than `t.id`
        selectId: (t: T) => t.id,
        // Keep the "all IDs" array sorted based on t name
        //sortComparer: (a, b) => a.name.localeCompare(b.name),
    })

    // Combina o estado inicial do adapter com estados adicionais
    const initialState = adapter.getInitialState<GenericState>({
        loading: false,
        error: null,
        lastUpdate: FormatRefreshTime(new Date()),
    });

    // Criar o thunk assíncrono para buscar dados
    const fetchItems = createAsyncThunk(`${name}/fetch`, async (session: Session, { rejectWithValue }) => {
        try {
            const items = await getItems(session);
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
            addItem: (state, action: PayloadAction<T>) => {
                adapter.addOne(state, action.payload);
            }, // Adiciona um item
            updateItem: (state, action: PayloadAction<PayloadAction<Update<T, string>>>) => {
                adapter.updateOne(state, action.payload);
            }, // Atualiza um item
            removeItem: (state, action: PayloadAction<string>) => {
                adapter.removeOne(state, action.payload);
            }, // Remove um item
        },
        extraReducers: (builder) => {
            builder
                .addCase(fetchItems.pending, (state) => {
                    state.loading = true;
                })
                .addCase(fetchItems.fulfilled, (state, action) => {
                    state.loading = false;
                    adapter.setAll(state, action.payload); // Substitui todos os itens
                    state.lastUpdate = FormatRefreshTime(new Date());
                })
                .addCase(fetchItems.rejected, (state, action) => {
                    state.loading = false;
                    state.error = action.payload as RequestError;
                });
        },
    });

    // Retornar o slice configurado
    return {
        reducer: slice.reducer,
        actions: slice.actions,
        fetchItems: fetchItems,
        adapterSelectors: adapter.getSelectors((state: any) => state[name]), // Seletores do adapter
    };
};

export default createGenericSlice;
