export default class ProcessRule {
    id: string = "";
    name: string = "";
    order: number = 0;
    description: string = "";
    imagePath: string = "";
    ideal_time: number = 0;
    experimental_error: number = 0;
    ideal_time_formatted: string = "";
    experimental_error_formatted: string = "";
    category_id: string = "";

    constructor() {}
}
