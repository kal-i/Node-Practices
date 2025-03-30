import { Response } from 'express';
import { AuthenticatedRequest } from '../types/customRequest';
import createHttpError from 'http-errors';
import prisma from '../models/prismaClient';

export const getUserAccounts = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const accounts = await prisma.account.findMany({ where: { userId: req.user?.id } });
        res.status(200).json({ message: 'Fetched accounts successful', accounts: accounts });
    } catch (error) {
        console.error('Failed to fetch user accounts: ', error);
        res.status(500).json({
            message: error instanceof createHttpError.HttpError
                ? error.message
                : 'Failed to fetch user accounts'
        });
    }
};

export const registerAccount = async (req: AuthenticatedRequest, res: Response) => {
    const { name, type, balance } = req.body;

    try {
        // Since we're using authMiddleware to verify jwt token and user session, returning userId
        // we can ignore these extraction process to get user id
        // const authHeader = req.headers.authorization;
        // if (!authHeader || !authHeader?.startsWith('Bearer ')) {
        //     throw createHttpError(401, 'Unauthorized: Missing or malformed token');
        // }

        // const token = authHeader.split(' ')[1];

        // const session = await prisma.session.findFirst({ where: { token: token } });
        // if (!session || session.expiresAt < new Date()) {
        //     throw createHttpError(401, 'Session expired');
        // }

        // const user = await prisma.user.findFirst({ where: { id: session.userId } });
        // if (!user) {
        //     throw createHttpError(401, 'User not found');
        // }

        const account = await prisma.account.create({
            data: {
                userId: req.user?.id as string,
                name: name,
                type: type,
                balance: balance
            }
        });

        res.status(200).json({
            message: 'Account registered',
            account: account
        });
    } catch (error) {
        console.error('Failed to register account: ', error);
        res.status(500).json({
            message: error instanceof createHttpError.HttpError
                ? error.message
                : 'Failed to register account'
        });
    }
}

export const updateAccount = async (req: AuthenticatedRequest, res: Response) => {
    const { accountId } = req.params;
    const { name, type, balance } = req.body;

    try {
        const account = await prisma.account.findFirst({ where: { id: accountId } });
        if (!account) {
            throw createHttpError(401, 'Account not found');
        }

        await prisma.account.update({
            where: { id: account.id },
            data: {
                name: name,
                type: type,
                balance: balance
            }
        });

        res.status(200).json({ message: 'Account updated successfully' });
    } catch (error) {
        console.error('Failed to update account: ', error);
        res.status(500).json({
            message: error instanceof createHttpError.HttpError
            ? error.message
            : 'Failed to update account'
        });
    }
}