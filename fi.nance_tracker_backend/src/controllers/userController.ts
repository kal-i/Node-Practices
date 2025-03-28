import { Request, Response } from 'express';
import createHttpError from 'http-errors';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import prisma from '../models/prismaClient';

export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await prisma.user.findMany();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};

export const loginUser = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            throw createHttpError(400, 'Email and password are required');
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (!existingUser) {
            throw createHttpError(400, 'User not found');
        }

        const existingUserPassword: string = existingUser?.password || '';
        const isPasswordValid = await bcrypt.compare(password, existingUserPassword);
        if (!isPasswordValid) {
            throw createHttpError(400, 'Invalid password');
        }

        const existingSession = await prisma.session.findFirst({
            where: { userId: existingUser.id },
        });

        if (existingSession && existingSession.expiresAt < new Date()) {
            await prisma.session.delete({ where: { id: existingSession.id } });
        }

        let sessionToken: string;

        if (!existingSession || existingSession.expiresAt < new Date()) {
            sessionToken = uuidv4(); // gen new session token

            await prisma.session.create({
                data: {
                    userId: existingUser.id,
                    token: sessionToken,
                    expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
                },
            });
        } else {
            sessionToken = existingSession.token;
        }

        res.status(200).json({ message: 'Login successful', sessionToken });
    } catch (error) {
        res.status(400).json({ message: `Failed to login user: ${error}` });
    }
}

export const loginUserWithJWTBasedAuth = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const JWT_SECRET = process.env.JWT_SECRET;

    try {
        if (!email || !password) {
            throw createHttpError(400, 'Email and password are required');
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (!existingUser) {
            throw createHttpError(400, 'User not found');
        }

        const existingUserPassword: string = existingUser?.password || '';
        const isPasswordValid = await bcrypt.compare(password, existingUserPassword);
        if (!isPasswordValid) {
            throw createHttpError(400, 'Invalid password');
        }

        if (!JWT_SECRET) {
            throw new Error('JWT_SECRET is not defined!');
        }

        const token = jwt.sign({ id: existingUser.id, email: existingUser.email }, JWT_SECRET, {
            expiresIn: '1h',
        });

        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: existingUser.id,
                name: existingUser.name,
                email: existingUser.email,
            },
        });
    } catch (error) {
        res.status(400).json({ message: `Failed to login user: ${error}` });
    }
}

export const registerUser = async (req: Request, res: Response) => {
    const { name, email, password } = req.body;

    try {
        if (!name || name.trim().length == 0) {
            throw createHttpError(400, 'Name cannot be empty or null');
        }

        if (!email || email.trim().length == 0) {
            throw createHttpError(400, 'Email cannot be empty or null');
        }

        if (!password || password.trim().length < 8) {
            throw createHttpError(400, 'Password cannot be empty or null and must have at least 8 characters.');
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) throw createHttpError(400, 'User already exists');

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword
            }
        });

        res.status(201).json({ message: 'User created successfully', user });
    } catch (error) {
        res.status(500).json({ message: `Failed to register user: ${error}` });
    }
}

export const logoutUserWithJwtBlacklisting = async (req: Request, res: Response) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw createHttpError(400, 'Unauthorized: Missing or malformed token');
        }

        const token = authHeader.split(' ')[1];

        if (!token) {
            throw createHttpError(400, 'Token is missing');
        }

        await prisma.blackListedToken.create({
            data: { token },
        });

        res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
        if (error instanceof createHttpError.HttpError) {
            res.status(error.statusCode).json({ message: error.message });
        } else {
            res.status(500).json({ message: `An error occured during logut: ${error}` });
        }
    }
}

export const logoutUser = async (req: Request, res: Response) => {
    const { token } = req.body;

    try {
        await prisma.session.delete({
            where: { token } ,
        });

        res.status(200).json({ message: 'Logout sucessful' });
    } catch (error) {
        if (error instanceof createHttpError.HttpError) {
            res.status(error.statusCode).json({ message: error.message });
        } else {
            res.status(500).json({ message: `An error occured during logut: ${error}` });
        }
    }
}