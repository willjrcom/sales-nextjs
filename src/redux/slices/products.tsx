import GetProducts from "@/app/api/product/route";
import createGenericSlice from "./generics";
import Product from "@/app/entities/product/product";

const productsSlice = createGenericSlice<Product>({ name: 'products', getItems: GetProducts })
export const { addItem: addProduct, removeItem: removeProduct, updateItem: updateProduct } = productsSlice.actions;
export const { fetchItems: fetchProducts, adapterSelectors } = productsSlice;
export default productsSlice.reducer;
