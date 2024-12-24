import createGenericSlice from "./generics";
import Table from "@/app/entities/table/table";
import GetUnusedTables from "@/app/api/table/unused/route";

const unusedTablesSlice = createGenericSlice<Table>({ name: 'tables', getItems: GetUnusedTables })
export const { addItem: addUnusedTable, removeItem: removeUnusedTable, updateItem: updateUnusedTable } = unusedTablesSlice.actions;
export const { fetchItems: fetchUnusedTables, adapterSelectors } = unusedTablesSlice;
export default unusedTablesSlice.reducer;
