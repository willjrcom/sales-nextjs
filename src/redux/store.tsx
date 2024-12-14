// redux/store.ts
import { configureStore } from '@reduxjs/toolkit';
import ordersReducer from './slices/orders';
import clientsReducer from './slices/clients';
import employeesReducer from './slices/employees';
import productsReducer from './slices/products';

export const store = configureStore({
    reducer: {
        orders: ordersReducer,
        clients: clientsReducer,
        employees: employeesReducer,
        products: productsReducer
    },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
