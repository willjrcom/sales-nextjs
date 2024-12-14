import GetClients from "@/app/api/client/route";
import createGenericSlice from "./generics";

const clientsSlice = createGenericSlice({ name: 'clients', getItems: GetClients })
export const { addItem: addClient, removeItem: removeClient, updateItem: updateClient } = clientsSlice.actions;
export const { fetchItems: fetchClients, adapterSelectors } = clientsSlice;
export default clientsSlice.reducer;
