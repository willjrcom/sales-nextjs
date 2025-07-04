import Table from "../table/table";

export default class PlaceTable {
    place_id: string = "";
    table_id: string = "";
    table: Table = new Table();
    column: number = 0;
    row: number = 0;
    
    
    constructor(data: Partial<PlaceTable> = {}) {
        Object.assign(this, data);
    }
}