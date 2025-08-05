import express from 'express';
import cors from 'cors';
import 'dotenv/config';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
/* ----------------------------------------- */

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));

import stravaRouter from './routes/strava.js';
app.use('/api/strava', stravaRouter);

app.listen(process.env.PORT ?? 3000, () =>
    console.log(`API on http://localhost:${process.env.PORT ?? 3000}`)
);
