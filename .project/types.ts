import { ObjectId } from "mongodb";

export interface User {
    _id?: ObjectId;
    email: string;
    password?: string;
    role: "ADMIN" | "USER";
    message?: string;
}
export interface FlashMessage {
    type: "error" | "success"
    message: string;
}
export enum Role {
    ADMIN = "ADMIN",
    USER = "USER"
}