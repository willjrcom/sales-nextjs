// redux/store.ts
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import ordersReducer from './slices/orders';
import clientsReducer from './slices/clients';
import employeesReducer from './slices/employees';
import placesReducer from './slices/places';
import deliveryDriversReducer from './slices/delivery-drivers';
import categoryReducer from './slices/categories';
import deliveryOrdersReducer from './slices/delivery-orders';
import storage from 'redux-persist/lib/storage';
import { persistReducer, persistStore } from 'redux-persist';

const persistConfig = {
    key: 'root', // Nome da chave no armazenamento
    storage, // Tipo de armazenamento (LocalStorage neste caso)
    whitelist: ['clients', 'employees', 'places', 'deliveryDrivers', 'categories'], // Reducers que serão persistidos
};

const rootReducer = combineReducers({
    orders: ordersReducer,
    clients: clientsReducer,
    employees: employeesReducer,
    places: placesReducer,
    deliveryDrivers: deliveryDriversReducer,
    categories: categoryReducer,
    deliveryOrders: deliveryOrdersReducer
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
