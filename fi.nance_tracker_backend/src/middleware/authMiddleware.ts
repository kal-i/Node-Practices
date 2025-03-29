import express, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import createHttpError from 'http-errors';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error('JWT_SECRET must be defined in environment variables.');
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader?.startsWith('Bearer ')) {
            throw createHttpError(401, 'Unauthorized: Missing or malformed token');
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET); 
        //req.user = decoded; // attach user info (decoded token) to the req obj

        next(); // token is valid, proceed to the next middleware or controller
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(401).json({
            message: 'Unauthorized: Invalid or expired token'
        });
    }
}