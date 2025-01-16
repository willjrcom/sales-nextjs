import GetClients from "@/app/api/client/client";
import createGenericSlice from "./generics";
import Client from "@/app/entities/client/client";

const clientsSlice = createGenericSlice<Client>({ name: 'clients', getItems: GetClients })
export const { addItem: addClient, removeItem: removeClient, updateItem: updateClient } = clientsSlice.actions;
export const { fetchItems: fetchClients, adapterSelectors } = clientsSlice;
export default clientsSlice.reducer;
