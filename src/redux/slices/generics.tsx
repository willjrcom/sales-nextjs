import { createSlice, createAsyncThunk, createEntityAdapter, EntityState, PayloadAction, Update } from '@reduxjs/toolkit';
import { Session } from 'next-auth';
import { FormatRefreshTime } from '@/app/components/crud/refresh';
import RequestError from '@/app/utils/error';
import { notifyError } from '@/app/utils/notifications';
import { GetAllResponse } from '@/app/api/request';

// Estado genérico adicional
export interface GenericState {
    loading: boolean;
    totalCount: number;
    lastUpdate: string;
}

export interface GenericsProps<T> {
    name: string;
    getItems?: (session: Session, page?: number, perPage?: number) => Promise<GetAllResponse<T>>;
    getItemsByID?: (id: string, session: Session) => Promise<GetAllResponse<T>>;
    getItem?: (session: Session) => Promise<T>;
}

export interface FetchItemsArgs {
    session: Session;
    page?: number;
    perPage?: number;
}

interface DefaultEntity {
    name?: any; 
    id: string;
}

// Configuração genérica do slice
const createGenericSlice = <T extends DefaultEntity>({ name, getItems }: GenericsProps<T>) => {
    const adapter = createEntityAdapter<T, string>({
        // Assume IDs are stored in a field other than `t.id`
        selectId: (t: T) => t.id,
        // Keep the "all IDs" array sorted based on t name
        // sortComparer: (a, b) => a.name.localeCompare(b.name),
    })

    // Combina o estado inicial do adapter com estados adicionais
    const initialState = adapter.getInitialState<GenericState>({
        loading: false,
        totalCount: 0,
        lastUpdate: FormatRefreshTime(new Date()),
    });

    // Criar o thunk assíncrono para buscar dados
    const fetchItems = createAsyncThunk(`${name}/fetch`, async ({session, page, perPage}: FetchItemsArgs, { rejectWithValue }) => {
        try {
            const response = await getItems!(session, page, perPage);
            const xTotalCount = response.headers.get("X-Total-Count")
            return { 
                payload: response.items, 
                totalCount: Number(xTotalCount),
            };
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
                    state.lastUpdate = FormatRefreshTime(new Date());
                    state.totalCount = action.payload.totalCount;
                    adapter.setAll(state, action.payload.payload);
                })
                .addCase(fetchItems.rejected, (state, action) => {
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
        fetchItems: fetchItems,
        adapterSelectors: adapter.getSelectors((state: any) => state[name]), // Seletores do adapter
    };
};

export default createGenericSlice;
