// redux/store.ts
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import ordersReducer from './slices/orders';
import deliveryOrdersReducer from './slices/delivery-orders';
import tableOrdersReducer from './slices/table-orders';
import clientsReducer from './slices/clients';
import employeesReducer from './slices/employees';
import placesReducer from './slices/places';
import unusedTablesReducer from './slices/unused-tables';
import deliveryDriversReducer from './slices/delivery-drivers';
import categoryReducer from './slices/categories';
import orderProcessesReducer from './slices/order-processes';
import usersReducer from './slices/users';
import userCompaniesReducer from './slices/user-companies';
import storage from 'redux-persist/lib/storage';
import { persistReducer, persistStore } from 'redux-persist';

const persistConfig = {
    key: 'root', // Nome da chave no armazenamento
    storage, // Tipo de armazenamento (LocalStorage neste caso)
    whitelist: ['clients', 'employees', 'places', 'deliveryDrivers', 'categories', 'user-companies'], // Reducers que serão persistidos
};

const rootReducer = combineReducers({
    orders: ordersReducer,
    deliveryOrders: deliveryOrdersReducer,
    tableOrders: tableOrdersReducer,
    clients: clientsReducer,
    employees: employeesReducer,
    places: placesReducer,
    unusedTables: unusedTablesReducer,
    deliveryDrivers: deliveryDriversReducer,
    categories: categoryReducer,
    orderProcesses: orderProcessesReducer,
    users: usersReducer,
    userCompanies: userCompaniesReducer,
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
