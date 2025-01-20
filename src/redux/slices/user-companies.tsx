import createGenericSlice from "./generics";
import Company from "@/app/entities/company/company";
import GetUserCompanies from "@/app/api/user/companies/user";

const userCompaniesSlice = createGenericSlice<Company>({ name: 'user-companies', getItems: GetUserCompanies })
export const { addItem: addCompany, removeItem: removeCompany, updateItem: updateCompany } = userCompaniesSlice.actions;
export const { fetchItems: fetchUserCompanies, adapterSelectors } = userCompaniesSlice;
export default userCompaniesSlice.reducer;
