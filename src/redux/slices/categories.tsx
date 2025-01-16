import createGenericSlice from "./generics";
import Category from "@/app/entities/category/category";
import GetCategories from "@/app/api/category/category";

const categoriesSlice = createGenericSlice<Category>({ name: 'categories', getItems: GetCategories })
export const { addItem: addCategory, removeItem: removeCategory, updateItem: updateCategory } = categoriesSlice.actions;
export const { fetchItems: fetchCategories, adapterSelectors } = categoriesSlice;
export default categoriesSlice.reducer;
