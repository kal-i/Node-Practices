import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const token = req.headers['authorization'];

    if (!token) { return res.status(401).json({ message: 'No token provided' }) }

    jwt.verify(token, process.env.JWT_SECRET || '', (error: any, decoded: any) => {
        if (error) { return res.status(401).json({ message: 'Invalid token' }) }

        req
    });
}

export default authMiddleware;