import express, { json } from 'express';
import cors from 'cors';
import 'dotenv/config';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import gameTypeRoutes from './routes/gameTypeRoutes.js';
import gameSessionRoutes from './routes/gameSessionRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import prisma from './prisma.js';

const app = express();

BigInt.prototype.toJSON = function() {
  return Number(this);
};

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(json());

// routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/gametype', gameTypeRoutes);
app.use('/api/gamesession', gameSessionRoutes);
app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await prisma.$connect();
    console.log('Database connected successfully');
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`API available at http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});