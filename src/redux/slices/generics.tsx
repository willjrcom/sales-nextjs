// redux/slices/genericSlice.ts
import { createSlice, PayloadAction, createAsyncThunk, Draft } from '@reduxjs/toolkit';
import { Session } from 'next-auth';
import { FormatRefreshTime } from '@/app/components/crud/refresh';
import RequestError from '@/app/api/error';

export interface GenericSlice<T extends { id: string }> {
    items: T[];
    loading: boolean;
    error: RequestError | null;
    lastUpdate: string;
}


interface GenericsProps <T> {
    name: string;
    getItems: (session: Session) => Promise<T[]>;
}

const createGenericSlice = <T extends { id: string }>({ name, getItems }: GenericsProps<T>) => {
    const initialState: GenericSlice<T> = {
        items: [],
        loading: false,
        error: null,
        lastUpdate: FormatRefreshTime(new Date()),
    };

    // Thunk para buscar os itens dinamicamente
    const fetchItems = createAsyncThunk(
        name + '/fetch',
        async (
            _,
            { getState, rejectWithValue }
        ) => {
            const { session }: any = getState();
            if (!session?.data?.user?.idToken) return rejectWithValue('No session token available');

            try {
                const items = await getItems(session.data)
                return items
            } catch (error) {
                return rejectWithValue(error as RequestError);
            }
        }
    );

    const slice = createSlice({
        name: name,
        initialState,
        reducers: {
            addItem: (state, action: PayloadAction<T>) => {
                state.items.push(action.payload as Draft<T>);
            },
            updateItem: (state, action: PayloadAction<T>) => {
                const index = state.items.findIndex((item) => item.id === action.payload.id);
                if (index !== -1) {
                    state.items[index] = { ...state.items[index], ...action.payload };
                }
            },
            
            removeItem: (state, action: PayloadAction<string>) => {
                state.items = state.items.filter((item) => item.id !== action.payload);
            },
            updateLastUpdate: (state) => {
                state.lastUpdate = FormatRefreshTime(new Date());
            },
        },
        extraReducers: (builder) => {
            builder
                .addCase(fetchItems.pending, (state) => {
                    state.loading = true;
                })
                .addCase(fetchItems.fulfilled, (state, action: PayloadAction<T[]>) => {
                    state.items = action.payload as Draft<T>[];
                    state.loading = false;
                    state.lastUpdate = FormatRefreshTime(new Date());
                })
                .addCase(fetchItems.rejected, (state, action) => {
                    state.error = action.payload as RequestError;
                    state.loading = false;
                });
        },
    });

    return { ...slice, fetchItems };
};

export default createGenericSlice;
