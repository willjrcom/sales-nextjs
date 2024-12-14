// redux/store.ts
import { configureStore } from '@reduxjs/toolkit';
import ordersReducer from './slices/orders';
import clientsReducer from './slices/clients';
import employeesReducer from './slices/employees';
import productsReducer from './slices/products';
import processRulesReducer from './slices/process-rules';
import tablesReducer from './slices/tables';

export const store = configureStore({
    reducer: {
        orders: ordersReducer,
        clients: clientsReducer,
        employees: employeesReducer,
        products: productsReducer,
        processRules: processRulesReducer,
        tables: tablesReducer
    },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
