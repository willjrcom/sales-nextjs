// redux/store.ts
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import ordersReducer from './slices/orders';
import deliveryOrdersReducer from './slices/delivery-orders';
import tableOrdersReducer from './slices/table-orders';
import clientsReducer from './slices/clients';
import employeesReducer, { employeesDeletedSlice } from './slices/employees';
import placesReducer from './slices/places';
import unusedTablesReducer from './slices/unused-tables';
import deliveryDriversReducer from './slices/delivery-drivers';
import pickupOrdersReducer from './slices/pickup-orders';
import categoryReducer from './slices/categories';
import orderProcessesReducer from './slices/order-processes';
import usersReducer from './slices/users';
import userCompaniesReducer from './slices/user-companies';
import shiftsReducer from './slices/shifts';
import {stocksReducer, lowStocksReducer, outOfStocksReducer, reportStocksReducer } from './slices/stock';
import storage from 'redux-persist/lib/storage';
import { persistReducer, persistStore } from 'redux-persist';
import createWebStorage from 'redux-persist/lib/storage/createWebStorage';

// Cria um storage noop para SSR (Server Side Rendering)
const createNoopStorage = () => {
    return {
        getItem(_key: string) {
            return Promise.resolve(null);
        },
        setItem(_key: string, value: any) {
            return Promise.resolve(value);
        },
        removeItem(_key: string) {
            return Promise.resolve();
        },
    };
};

// Verifica se está no lado do cliente ou servidor
const customStorage = typeof window !== 'undefined' 
    ? createWebStorage('local') 
    : createNoopStorage();

const persistConfig = {
    key: 'root', // Nome da chave no armazenamento
    storage: customStorage, // Tipo de armazenamento (LocalStorage neste caso)
    whitelist: ['clients', 'employees', 'employeesDeleted', 'places', 'deliveryDrivers', 'categories', 'user-companies', 'stock'], // Reducers que serão persistidos
};

const rootReducer = combineReducers({
    orders: ordersReducer,
    deliveryOrders: deliveryOrdersReducer,
    pickupOrders: pickupOrdersReducer,
    tableOrders: tableOrdersReducer,
    clients: clientsReducer,
    employees: employeesReducer,
    employeesDeleted: employeesDeletedSlice.reducer,
    places: placesReducer,
    unusedTables: unusedTablesReducer,
    deliveryDrivers: deliveryDriversReducer,
    categories: categoryReducer,
    orderProcesses: orderProcessesReducer,
    users: usersReducer,
    userCompanies: userCompaniesReducer,
    shifts: shiftsReducer,
    stocks: stocksReducer,
    lowStocks: lowStocksReducer,
    outOfStocks: outOfStocksReducer,
    reportStocks: reportStocksReducer,
});

// Aplica o persistReducer para o rootReducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false, // Necessário para evitar erros do Redux Persist
        }),
});

export const persistor = persistStore(store);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
