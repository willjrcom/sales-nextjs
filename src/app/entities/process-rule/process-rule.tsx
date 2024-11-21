export default class ProcessRule {
    id: string = "";
    name: string = "";
    order: number = 0;
    description: string = "";
    imagePath: string = "";
    idealTime: number = 0;
    experimentalError: number = 0;
    idealTimeFormatted: string = "";
    experimentalErrorFormatted: string = "";
    categoryId: string = "";

    constructor() {}
}
