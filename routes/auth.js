import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { body, validationResult } from 'express-validator';
import { dbRun, dbGet, dbAll } from '../database/db.js';

const router = express.Router();

// Configurar Google OAuth
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback'
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await dbGet('SELECT * FROM users WHERE google_id = ?', [profile.id]);
      
      if (!user) {
        // Criar novo usuário
        const result = await dbRun(
          'INSERT INTO users (email, name, google_id, avatar_url) VALUES (?, ?, ?, ?)',
          [profile.emails[0].value, profile.displayName, profile.id, profile.photos[0]?.value]
        );
        user = await dbGet('SELECT * FROM users WHERE id = ?', [result.lastID]);
      }
      
      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }));

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await dbGet('SELECT * FROM users WHERE id = ?', [id]);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
}

// Registrar novo usuário
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').trim().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name } = req.body;

    // Verificar se email já existe
    const existingUser = await dbGet('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar usuário
    const result = await dbRun(
      'INSERT INTO users (email, password, name) VALUES (?, ?, ?)',
      [email, hashedPassword, name]
    );

    // Gerar token
    const token = jwt.sign(
      { id: result.lastID, email },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: result.lastID,
        email,
        name
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Erro ao criar conta' });
  }
});

// Login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Buscar usuário
    const user = await dbGet('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(401).json({ error: 'Email ou senha inválidos' });
    }

    // Verificar senha
    if (user.password) {
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: 'Email ou senha inválidos' });
      }
    } else {
      return res.status(401).json({ error: 'Conta criada com Google. Use login social.' });
    }

    // Gerar token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar_url: user.avatar_url
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
});

// Google OAuth - Iniciar
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Google OAuth - Callback
router.get('/google/callback',
  passport.authenticate('google', { session: false }),
  async (req, res) => {
    try {
      const user = req.user;
      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '7d' }
      );

      // Redirecionar para frontend com token
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback?token=${token}`);
    } catch (error) {
      console.error('Google callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=oauth_failed`);
    }
  }
);

// Verificar token
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    const user = await dbGet('SELECT id, email, name, avatar_url FROM users WHERE id = ?', [decoded.id]);

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json({ user });
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
});

export default router;

