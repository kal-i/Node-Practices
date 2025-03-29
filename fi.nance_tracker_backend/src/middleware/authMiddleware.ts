import express, { Request, Response, NextFunction } from 'express';
import createHttpError from 'http-errors';
import prisma from '../models/prismaClient';

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader?.startsWith('Bearer ')) {
            throw createHttpError(401, 'Unauthorized: Missing or malformed token');
        }

        const token = authHeader.split(' ')[1];
        const session = await prisma.session.findUnique({ 
            where: { token } 
        });

        if (!session || session.expiresAt < new Date()) {
            if (session) {
                await prisma.session.delete({
                    where: { id: session.id }
                });
            }
            return next(createHttpError(401, 'Session expired'));
        }

        next(); // token is valid, proceed to the next middleware or controller
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(401).json({
            message: 'Unauthorized: Invalid or expired token'
        });
    }
}