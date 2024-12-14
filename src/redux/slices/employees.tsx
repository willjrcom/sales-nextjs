import createGenericSlice from "./generics";
import GetEmployees from "@/app/api/employee/route";

const employeesSlice = createGenericSlice({ name: 'employees', getItems: GetEmployees })
export const { addItem: addEmployee, removeItem: removeEmployee, updateItem: updateEmployee } = employeesSlice.actions;
export const { fetchItems: fetchEmployees, adapterSelectors } = employeesSlice;
export default employeesSlice.reducer;
