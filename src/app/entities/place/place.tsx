import Table from "../table/table";
import PlaceTable from "./place_table";

export default class Place {
    id: string = "";
    name: string = "";
    image_path: string = "";
    is_available: boolean = false;
    tables: PlaceTable[] = [];
    
    constructor() {}
}