import GetProducts from "@/app/api/client/route";
import createGenericSlice from "./generics";

const productsSlice = createGenericSlice({ name: 'products', getItems: GetProducts })
export const { addItem: addProduct, removeItem: removeProduct, updateItem: updateProduct } = productsSlice.actions;
export const { fetchItems: fetchProducts, adapterSelectors } = productsSlice;
export default productsSlice.reducer;
