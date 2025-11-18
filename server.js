import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import passport from 'passport';
import { initDatabase } from './database/db.js';
import authRoutes from './routes/auth.js';
import buttonRoutes from './routes/buttons.js';
import scriptRoutes from './routes/script.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/buttons', buttonRoutes);
app.use('/api/script', scriptRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'ChatButtons API is running' });
});

// Inicializar banco de dados e servidor
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('❌ Error initializing database:', err);
  process.exit(1);
});

