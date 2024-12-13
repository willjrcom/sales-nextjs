// redux/slices/counterSlice.ts
import Order from '@/app/entities/order/order';
import createGenericSlice from './generics';
import GetOrders from '@/app/api/order/route';

const ordersSlice = createGenericSlice<Order>({ name: 'orders', getItems: GetOrders });

export const { addItem: addOrder, removeItem: removeOrder, updateItem: updateOrder } = ordersSlice.actions;
export const { fetchItems: fetchOrders } = ordersSlice;
export default ordersSlice.reducer;
