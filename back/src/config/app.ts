import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './env.js';
import router from '../routes/auth.js';
import { errorHandler } from './ErrorHandler.js';

const app = express();

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send('Welcome to Oclaris API');
});

app.use('/api', router);

app.use(cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
}));

app.use(helmet());

app.use(errorHandler);

export default app;