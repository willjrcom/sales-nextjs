import GetTables from "@/app/api/table/table";
import createGenericSlice from "./generics";
import Table from "@/app/entities/table/table";

const tablesSlice = createGenericSlice<Table>({ name: 'tables', getItems: GetTables })
export const { addItem: addTable, removeItem: removeTable, updateItem: updateTable } = tablesSlice.actions;
export const { fetchItems: fetchTables, adapterSelectors } = tablesSlice;
export default tablesSlice.reducer;
