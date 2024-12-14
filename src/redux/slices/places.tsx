import GetPlaces from "@/app/api/place/route";
import createGenericSlice from "./generics";
import Place from "@/app/entities/place/place";

const placesSlice = createGenericSlice<Place>({ name: 'places', getItems: GetPlaces })
export const { addItem: addPlace, removeItem: removePlace, updateItem: updatePlace } = placesSlice.actions;
export const { fetchItems: fetchPlaces, adapterSelectors } = placesSlice;
export default placesSlice.reducer;
