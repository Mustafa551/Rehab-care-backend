import dotenv from 'dotenv';
import cors from 'cors';
import express, { Express, json, Request, Response } from 'express';
import userRoutes from './routes/userRoutes';
import staffRoutes from './routes/staffRoutes';

dotenv.config();

const app: Express = express();

console.log('PROCESS ENV', process.env);

app.get('/', (req: Request, res: Response) => {
  return res.status(200).json({ success: true, greeting: 'Hello from Server' });
});

app.get('/api/v1/', (req: Request, res: Response) => {
  return res.status(200).json({ success: true, greeting: 'Hello from API' });
});

app.get('/api/v1/hi', (req: Request, res: Response) => {
  return res.status(200).json({ success: true, greeting: 'Hi from API' });
});

app.use(cors({ origin: '*', methods: '*' }));
app.use(json());

app.use('/api/v1/user', userRoutes);
app.use('/api/v1/staff', staffRoutes);

app.use((req: Request, res: Response) => {
  console.log('🚀 ~ app.use ~ req:', req);

  return res.status(404).json({
    error: true,
    message: 'Url not found',
  });
});

export { app };

