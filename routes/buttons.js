import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken } from '../middleware/auth.js';
import { dbRun, dbGet, dbAll } from '../database/db.js';

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(authenticateToken);

// Listar todos os botões do usuário
router.get('/', async (req, res) => {
  try {
    const buttons = await dbAll(
      'SELECT * FROM buttons WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(buttons);
  } catch (error) {
    console.error('List buttons error:', error);
    res.status(500).json({ error: 'Erro ao listar botões' });
  }
});

// Obter um botão específico
router.get('/:id', async (req, res) => {
  try {
    const button = await dbGet(
      'SELECT * FROM buttons WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (!button) {
      return res.status(404).json({ error: 'Botão não encontrado' });
    }

    res.json(button);
  } catch (error) {
    console.error('Get button error:', error);
    res.status(500).json({ error: 'Erro ao buscar botão' });
  }
});

// Criar novo botão
router.post('/', [
  body('name').trim().notEmpty().withMessage('Nome é obrigatório'),
  body('link_type').isIn(['url', 'whatsapp']).withMessage('Tipo de link inválido'),
  body('position').isIn(['bottom-right', 'bottom-left', 'top-right', 'top-left']).withMessage('Posição inválida'),
  body('link_url').if(body('link_type').equals('url')).notEmpty().withMessage('URL é obrigatória para tipo URL'),
  body('whatsapp_ddd').if(body('link_type').equals('whatsapp')).notEmpty().withMessage('DDD é obrigatório'),
  body('whatsapp_number').if(body('link_type').equals('whatsapp')).notEmpty().withMessage('Número é obrigatório')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, link_type, link_url, whatsapp_ddd, whatsapp_number, position } = req.body;

    let finalUrl = link_url;
    if (link_type === 'whatsapp') {
      // Remover caracteres não numéricos
      const ddd = whatsapp_ddd.replace(/\D/g, '');
      const number = whatsapp_number.replace(/\D/g, '');
      finalUrl = `https://wa.me/55${ddd}${number}`;
    }

    const result = await dbRun(
      `INSERT INTO buttons (user_id, name, link_type, link_url, whatsapp_ddd, whatsapp_number, position)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, name, link_type, finalUrl, whatsapp_ddd || null, whatsapp_number || null, position]
    );

    const button = await dbGet('SELECT * FROM buttons WHERE id = ?', [result.lastID]);
    res.status(201).json(button);
  } catch (error) {
    console.error('Create button error:', error);
    res.status(500).json({ error: 'Erro ao criar botão' });
  }
});

// Atualizar botão
router.put('/:id', [
  body('name').trim().notEmpty().withMessage('Nome é obrigatório'),
  body('link_type').isIn(['url', 'whatsapp']).withMessage('Tipo de link inválido'),
  body('position').isIn(['bottom-right', 'bottom-left', 'top-right', 'top-left']).withMessage('Posição inválida')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Verificar se o botão pertence ao usuário
    const existingButton = await dbGet(
      'SELECT * FROM buttons WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (!existingButton) {
      return res.status(404).json({ error: 'Botão não encontrado' });
    }

    const { name, link_type, link_url, whatsapp_ddd, whatsapp_number, position } = req.body;

    let finalUrl = link_url;
    if (link_type === 'whatsapp') {
      const ddd = whatsapp_ddd.replace(/\D/g, '');
      const number = whatsapp_number.replace(/\D/g, '');
      finalUrl = `https://wa.me/55${ddd}${number}`;
    }

    await dbRun(
      `UPDATE buttons 
       SET name = ?, link_type = ?, link_url = ?, whatsapp_ddd = ?, whatsapp_number = ?, position = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND user_id = ?`,
      [name, link_type, finalUrl, whatsapp_ddd || null, whatsapp_number || null, position, req.params.id, req.user.id]
    );

    const button = await dbGet('SELECT * FROM buttons WHERE id = ?', [req.params.id]);
    res.json(button);
  } catch (error) {
    console.error('Update button error:', error);
    res.status(500).json({ error: 'Erro ao atualizar botão' });
  }
});

// Deletar botão
router.delete('/:id', async (req, res) => {
  try {
    const result = await dbRun(
      'DELETE FROM buttons WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Botão não encontrado' });
    }

    res.json({ message: 'Botão deletado com sucesso' });
  } catch (error) {
    console.error('Delete button error:', error);
    res.status(500).json({ error: 'Erro ao deletar botão' });
  }
});

export default router;

