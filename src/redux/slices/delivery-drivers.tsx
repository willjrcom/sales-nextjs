import GetDeliveryDrivers from "@/app/api/delivery-driver/delivery-driver";
import createGenericSlice from "./generics";
import DeliveryDriver from "@/app/entities/delivery-driver/delivery-driver";

const deliveryDriversSlice = createGenericSlice<DeliveryDriver>({ name: 'deliveryDrivers', getItems: GetDeliveryDrivers })
export const { addItem: addDeliveryDriver, removeItem: removeDeliveryDriver, updateItem: updateDeliveryDriver } = deliveryDriversSlice.actions;
export const { fetchItems: fetchDeliveryDrivers, adapterSelectors } = deliveryDriversSlice;
export default deliveryDriversSlice.reducer;
