import express, { Application } from 'express';
import userRoutes from './routes/userRoutes';

const app: Application = express();

// Middle to parse incoming JSON request bodies
app.use(express.json());

// Mounting the user routes on the path /auth
app.use('/users', userRoutes);

export default app;