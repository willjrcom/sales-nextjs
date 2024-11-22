import Table from "../table/table";

export default class Place {
    id: string = "";
    name: string = "";
    image_path: string = "";
    is_available: boolean = false;
    tables: Table[] = [];
    
    constructor() {}
}