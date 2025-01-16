import Employee from "@/app/entities/employee/employee";
import createGenericSlice from "./generics";
import GetEmployees from "@/app/api/employee/employee";

const employeesSlice = createGenericSlice<Employee>({ name: 'employees', getItems: GetEmployees })
export const { addItem: addEmployee, removeItem: removeEmployee, updateItem: updateEmployee } = employeesSlice.actions;
export const { fetchItems: fetchEmployees, adapterSelectors } = employeesSlice;
export default employeesSlice.reducer;
