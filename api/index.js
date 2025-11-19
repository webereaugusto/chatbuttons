import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import passport from 'passport';
import { initDatabase } from '../database/db.js';
import authRoutes from '../routes/auth.js';
import buttonRoutes from '../routes/buttons.js';
import scriptRoutes from '../routes/script.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

// Rotas - No Vercel, quando acessado via /api/*, o path já inclui /api
app.use('/api/auth', authRoutes);
app.use('/api/buttons', buttonRoutes);
app.use('/api/script', scriptRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'ChatButtons API is running' });
});

// Inicializar banco de dados
initDatabase().catch(err => {
  console.error('❌ Error initializing database:', err);
});

// Handler para Vercel Serverless Functions
export default (req, res) => {
  return app(req, res);
};
