import createGenericSlice from "./generics";
import GetAllShifts from "@/app/api/shift/all/shift";
import Shift from "@/app/entities/shift/shift";

const shiftsSlice = createGenericSlice<Shift>({ name: 'shifts', getItems: GetAllShifts })
export const { addItem: addShift, removeItem: removeShift, updateItem: updateShift } = shiftsSlice.actions;
export const { fetchItems: fetchShifts, adapterSelectors } = shiftsSlice;
export default shiftsSlice.reducer;
