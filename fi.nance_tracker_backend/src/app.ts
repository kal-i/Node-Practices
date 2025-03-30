import express, { Application } from 'express';
import userRoutes from './routes/userRoutes';
import accountRoutes from './routes/accountRoutes';
//import transactionRoutes from './routes/transactionRoutes';

const app: Application = express();

// Middle to parse incoming JSON request bodies
app.use(express.json());

// Mounting the user routes on the path /auth
app.use('/users', userRoutes);
app.use('/accounts', accountRoutes);
//app.use('/transactions', transactionRoutes);

export default app;