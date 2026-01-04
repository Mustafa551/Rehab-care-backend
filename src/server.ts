import dotenv from 'dotenv';
import cors from 'cors';
import express, { Express, json, Request, Response } from 'express';
import userRoutes from './routes/userRoutes';
import staffRoutes from './routes/staffRoutes';
import patientRoutes from './routes/patientRoutes';
import vitalSignsRoutes from './routes/vitalSignsRoutes';
import nurseReportsRoutes from './routes/nurseReportsRoutes';
import patientConditionsRoutes from './routes/patientConditionsRoutes';
import medicationsRoutes from './routes/medicationsRoutes';

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
app.use('/api/v1/patients', patientRoutes);
app.use('/api/v1/vital-signs', vitalSignsRoutes);
app.use('/api/v1/nurse-reports', nurseReportsRoutes);
app.use('/api/v1/patient-conditions', patientConditionsRoutes);
app.use('/api/v1/medications', medicationsRoutes);

app.use((req: Request, res: Response) => {
  console.log('🚀 ~ app.use ~ req:', req);

  return res.status(404).json({
    error: true,
    message: 'Url not found',
  });
});

export { app };

