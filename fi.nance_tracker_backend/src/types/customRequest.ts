import { Request } from 'express';

// Custom Request Type extending the base Request from Express to add user property
export interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email?: string;
        name?: string;
    };
}