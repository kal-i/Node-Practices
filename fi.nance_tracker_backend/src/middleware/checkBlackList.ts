import { Request, Response, NextFunction } from "express";
import prisma from '../models/prismaClient';

export const checkBlackLst = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) res.status(401).json({ message: 'Unauthorized' });

    const blackListedToken = await prisma.blackListedToken.findUnique({ where: { token } });
    if (blackListedToken) res.status(401).json({ message: 'Token has been blacklisted' });

    next();
}