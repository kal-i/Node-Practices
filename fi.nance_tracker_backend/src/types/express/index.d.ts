import { JwtPayload } from "jsonwebtoken";

declare namespace Express {
    export interface Request {
        user?: string | JwtPayload; // Adjust type according to the payload in your JWT
    }
}