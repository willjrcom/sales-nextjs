import Employee from "@/app/entities/employee/employee";
import createGenericSlice from "./generics";
import GetEmployees from "@/app/api/employee/employee";
import { GetEmployeesDeleted } from "@/app/api/employee/employee";

const employeesSlice = createGenericSlice<Employee>({ name: 'employees', getItems: GetEmployees })
export const { addItem: addEmployee, removeItem: removeEmployee, updateItem: updateEmployee } = employeesSlice.actions;
export const { fetchItems: fetchEmployees, adapterSelectors } = employeesSlice;

const employeesDeletedSlice = createGenericSlice<Employee>({ name: 'employeesDeleted', getItems: GetEmployeesDeleted })
export const { addItem: addEmployeeDeleted, removeItem: removeEmployeeDeleted, updateItem: updateEmployeeDeleted } = employeesDeletedSlice.actions;
export const { fetchItems: fetchEmployeesDeleted, adapterSelectors: adapterSelectorsDeleted } = employeesDeletedSlice;

export { employeesDeletedSlice };

export default employeesSlice.reducer;
