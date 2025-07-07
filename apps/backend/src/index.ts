import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', date: new Date() });
});

// Aquí irán los endpoints del MVP (usuarios, combos, pagos, etc.)

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Club+ backend corriendo en puerto ${PORT}`);
});
