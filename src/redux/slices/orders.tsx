// redux/slices/counterSlice.ts
import Order from '@/app/entities/order/order';
import createGenericSlice from './generics';
import GetOrders from '@/app/api/order/route';

const ordersSlice = createGenericSlice<Order>({ name: 'orders', getItems: GetOrders });

export const { addItem, removeItem, updateItem } = ordersSlice.actions;

export default ordersSlice.reducer;
