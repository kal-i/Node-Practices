import { Request, Response } from 'express';
import createHttpError from 'http-errors';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import prisma from '../models/prismaClient';

const JWT_SECRET = process.env.JWT_SECRET;

const generateToken = (userId: string, email: string): string => {
    return jwt.sign({ id: userId, email }, process.env.JWT_SECRET!, { expiresIn: '1h' });
};

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
        if (!email?.trim() || !password?.trim()) {
            throw createHttpError(400, 'Email and password are required');
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (!existingUser) throw createHttpError(400, 'User not found');


        const existingUserPassword: string = existingUser.password;
        const isPasswordValid = await bcrypt.compare(password, existingUserPassword);
        if (!isPasswordValid) throw createHttpError(400, 'Invalid password');

        await prisma.session.deleteMany({ where: { id: existingUser.id, expiresAt: { lt: new Date() } } });

        let session = await prisma.session.findFirst({ where: { userId: existingUser.id } });
        const EXPIRATION_TIME = 60 * 60 * 1000;
        if (!session) {
            session = await prisma.session.create({
                data: {
                    userId: existingUser.id,
                    token: generateToken(existingUser.id, existingUser.email),
                    expiresAt: new Date(Date.now() + EXPIRATION_TIME)
                },
            });
        }

        res.status(200).json({
            message: 'Login successful',
            token: session.token,
            user: {
                id: existingUser.id,
                name: existingUser.name,
                email: existingUser.email,
            },
        });

    } catch (error) {
        console.error('Login error:', error);
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

        const saltRounds = Number(process.env.SALT_ROUNDS || 10);
        if (isNaN(saltRounds) || saltRounds <= 0) {
            throw new Error('Invalid SALT_ROUNDS configuration');
        }
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword
            }
        });

        res.status(201).json({ message: 'User created successfully', user });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: `Failed to register user: ${error}` });
    }
}

export const logoutUser = async (req: Request, res: Response) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw createHttpError(401, 'Unauthorized: Missing or malformed token');
        }

        const extractedToken: string = authHeader.split(' ')[1];

        if (!extractedToken) {
            throw createHttpError(401, 'Unauthorized: Token is missing');
        }

        const decodedToken = jwt.verify(extractedToken, JWT_SECRET!);



        await prisma.session.delete({
            where: { token: extractedToken },
        });

        res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
        console.error('Logout error:', error);
        if (error instanceof createHttpError.HttpError) {
            res.status(error.statusCode).json({ message: error.message });
        } else {
            res.status(500).json({ message: `An error occurred during logut: ${error}` });
        }
    }
}
