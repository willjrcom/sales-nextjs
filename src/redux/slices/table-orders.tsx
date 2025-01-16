import createGenericSlice from "./generics";
import GetOrderTables from "@/app/api/order-table/order-table";
import OrderTable from "@/app/entities/order/order-table";

const tableOrdersSlice = createGenericSlice<OrderTable>({ name: 'tableOrders', getItems: GetOrderTables })
export const { addItem: addTableOrder, removeItem: removeTableOrder, updateItem: updateTableOrder } = tableOrdersSlice.actions;
export const { fetchItems: fetchTableOrders, adapterSelectors } = tableOrdersSlice;
export default tableOrdersSlice.reducer;
