'use client';

export default class RequestError {
    message: string = "";
    status: number = 0;
    path: string = "";

    constructor(message?: string, status?: number, path?: string) {
        this.message = message || "";
        this.status = status || 0;
        this.path = path || "";
    };
}