import { Response } from 'express';
import { AuthenticatedRequest } from "../types/customRequest";
import createHttpError from 'http-errors';
import prisma from '../models/prismaClient';

export const getTransactions = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const user = await prisma.user.findFirst({ where: { id: req.user?.id } });
        if (!user) {
            throw createHttpError(401, 'User not found');
        }

        const accounts = await prisma.account.findMany({ where: { userId: user.id } });
        if (!accounts) {
            throw createHttpError(401, 'No accounts found');
        }

        let transactions = [];
        for (const account of accounts) {
            transactions.push(
                await prisma.baseTransaction.findMany({ where: { accountId: account.id } })
            );
        }

        res.status(200).json({ transactions: transactions, });
    } catch (error) {
        console.error('Failed to fetch transactions: ', error);
        res.status(500).json({
            message: error instanceof createHttpError.HttpError
            ? error.message
            : 'Failed to fetch transaction'
        });
    }
}

export const registerExpenseTransaction = async (req: AuthenticatedRequest, res: Response) => {
    const { accountId, amount, note, date } = req.body;

    try {
        const account = await prisma.account.findFirst({ where: { id: accountId } });
        if (!account) {
            throw createHttpError(401, 'Account not found');
        }

        const baseTransaction = await prisma.baseTransaction.create({
            data: {
                accountId: accountId,
                amount: amount,
                note: note,
                date: date
            }
        });

        const expenseTransaction = await prisma.expenseTransaction.create({
            data: {
                baseTransactionId: baseTransaction.id
            }
        });

        const updatedAccount = await prisma.account.update({
            where: { id: account.id },
            data: {
                balance: Number(account.balance) - amount
            }
        });

        res.status(200).json({ 
            message: 'Expense transaction registered', 
            baseTransaction: baseTransaction, 
            concreteTransaction: expenseTransaction
         });
    } catch (error) {
        console.error('Failed to register expense transaction: ', error);
        res.status(500).json({
            message: error instanceof createHttpError.HttpError
            ? error.message
            : 'Failed to register expense'
        });
    }
}

export const registerIncomeTransaction = async (req: AuthenticatedRequest, res: Response) => {
    const { accountId, amount, note, date } = req.body;

    try {
        const account = await prisma.account.findFirst({ where: { id: accountId } });
        if (!account) {
            throw createHttpError(401, 'Account not found');
        }

        const baseTransaction = await prisma.baseTransaction.create({
            data: {
                accountId: accountId,
                amount: amount,
                note: note,
                date: date
            }
        });

        const incomeTransaction = await prisma.incomeTransaction.create({
            data: {
                baseTransactionId: baseTransaction.id,
            }
        });

        const updatedAccount = await prisma.account.update({
            where: { id: account.id },
            data: {
                balance: Number(account.balance) + amount
            }
        });

        res.status(200).json({
            message: 'Income transaction registered',
            baseTransaction: baseTransaction,
            concreteTransaction: incomeTransaction
        });
    } catch (error) {
        console.error('Failed to register income transaction: ', error);
        res.status(500).json({
            message: error instanceof createHttpError.HttpError
            ? error.message
            : 'Failed to register income'
        });
    }
}

export const registerTransferTransction = async (req: AuthenticatedRequest, res: Response) => {
    const { senderAccountId, recipientAccountId, amount, note, date } = req.body;

    try {
        const senderAccount = await prisma.account.findFirst({ where: { id: senderAccountId } });
        if (!senderAccount) {
            throw createHttpError(401, 'Sender account not found');
        }

        const recipientAccount = await prisma.account.findFirst({ where: { id: recipientAccountId } });
        if (!recipientAccount) {
            throw createHttpError(401, 'Recipient account not found');
        }

        const baseTransaction = await prisma.baseTransaction.create({
            data: {
                accountId: senderAccountId,
                amount: amount,
                note: note,
                date: date
            }
        });

        const transferTransaction = await prisma.transferTransaction.create({
            data: {
                baseTransactionId: baseTransaction.id,
                receipientAccountId: recipientAccount.id,
            }
        });

        const updatedSenderAccount = await prisma.account.update({
            where: { id: senderAccount.id },
            data: {
                balance: Number(senderAccount.balance) - amount
            }
        });

        const updatedRecipientAccount = await prisma.account.update({
            where: { id: recipientAccount.id },
            data: {
                balance: Number(recipientAccount.balance) + amount
            }
        });

        res.status(200).json({
            message: 'Transfer transaction registered',
            baseTransaction: baseTransaction,
            concreteTransaction: transferTransaction
        });
    } catch (error) {
        console.error('Failted to register transfer transaction: ', error);
    }
}