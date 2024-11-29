import Table from "../table/table";

export default class PlaceTable {
    place_id: string = "";
    table_id: string = "";
    table: Table = new Table();
    column: number = 0;
    row: number = 0;
    
    constructor(place_id = "", table_id = "", column = 0, row = 0) {
        this.place_id = place_id;
        this.table_id = table_id;
        this.column = column;
        this.row = row;
    }
}