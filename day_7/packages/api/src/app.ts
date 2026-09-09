import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import authRouter from './routes/auth';
import propertiesRouter from './routes/properties';
import enquiriesRouter from './routes/enquiries';
import favouritesRouter from './routes/favourites';
import locationsRouter from './routes/locations';
import categoriesRouter from './routes/categories';
import usersRouter from './routes/users';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Serve uploaded images statically
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRouter);
app.use('/api/properties', propertiesRouter);
app.use('/api/properties/:id/enquiries', enquiriesRouter);
app.use('/api/favourites', favouritesRouter);
app.use('/api/locations', locationsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/users', usersRouter);

export default app;
