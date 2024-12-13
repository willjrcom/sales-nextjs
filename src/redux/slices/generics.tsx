import { createSlice, createAsyncThunk, PayloadAction, Draft } from '@reduxjs/toolkit';
import { Session } from 'next-auth';
import { FormatRefreshTime } from '@/app/components/crud/refresh';
import RequestError from '@/app/api/error';
import GetOrders from '@/app/api/order/route';

export interface GenericSlice<T extends { id: string }> {
    items: T[];
    loading: boolean;
    error: RequestError | null;
    lastUpdate: string;
}

interface GenericsProps<T> {
    name: string;
    getItems: (session: Session) => Promise<T[]>;
}

export const fetchItems = createAsyncThunk(
    'items/fetchItems',
    async (session: Session, { rejectWithValue }) => {
        try {
            const orders = GetOrders(session);
            return orders;  // Retorna os dados
        } catch (error) {
            return rejectWithValue(error);  // Caso de erro
        }
    }
);


const createGenericSlice = <T extends { id: string }>({ name, getItems }: GenericsProps<T>) => {
    const initialState: GenericSlice<T> = {
        items: [],
        loading: false,
        error: null,
        lastUpdate: FormatRefreshTime(new Date()),
    };

    const slice = createSlice({
        name,
        initialState,
        reducers: {
            addItem: (state: Draft<GenericSlice<T>>, action: PayloadAction<T>) => {
                state.items.push(action.payload as Draft<T>);
            },
            updateItem: (state: Draft<GenericSlice<T>>, action: PayloadAction<T>) => {
                const index = state.items.findIndex((item) => item.id === action.payload.id);
                if (index !== -1) {
                    state.items[index] = { ...state.items[index], ...action.payload };
                }
            },
            removeItem: (state: Draft<GenericSlice<T>>, action: PayloadAction<string>) => {
                state.items = state.items.filter((item) => item.id !== action.payload);
            },
        },
        extraReducers: (builder) => {
            builder
                .addCase(fetchItems.pending, (state) => {
                    state.loading = true;
                })
                .addCase(fetchItems.fulfilled, (state, action) => {
                    state.loading = false;
                    state.items = action.payload as unknown as Draft<T>[]; // Atualiza os itens
                    state.lastUpdate = FormatRefreshTime(new Date());
                })
                .addCase(fetchItems.rejected, (state, action) => {
                    state.loading = false;
                    state.error = action.payload as RequestError;
                });
        },
    });

    return { ...slice, fetchItems };
};

export default createGenericSlice;
