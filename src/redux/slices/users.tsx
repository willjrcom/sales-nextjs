import GetUsers from "@/app/api/company/users/route";
import createGenericSlice from "./generics";
import User from "@/app/entities/user/user";

const usersSlice = createGenericSlice<User>({ name: 'users', getItems: GetUsers })
export const { addItem: addUser, removeItem: removeUser, updateItem: updateUser } = usersSlice.actions;
export const { fetchItems: fetchUsers, adapterSelectors } = usersSlice;
export default usersSlice.reducer;
