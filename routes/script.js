import express from 'express';
import { dbGet } from '../database/db.js';

const router = express.Router();

// Gerar script JavaScript para um botão específico
router.get('/:id', async (req, res) => {
  try {
    const button = await dbGet('SELECT * FROM buttons WHERE id = ?', [req.params.id]);

    if (!button) {
      return res.status(404).json({ error: 'Botão não encontrado' });
    }

    // Mapear posições para CSS
    const positionMap = {
      'bottom-right': { bottom: '20px', right: '20px' },
      'bottom-left': { bottom: '20px', left: '20px' },
      'top-right': { top: '20px', right: '20px' },
      'top-left': { top: '20px', left: '20px' }
    };

    const position = positionMap[button.position] || positionMap['bottom-right'];

    // Gerar código JavaScript
    const topStyle = position.top ? `top: ${position.top};` : '';
    const bottomStyle = position.bottom ? `bottom: ${position.bottom};` : '';
    const leftStyle = position.left ? `left: ${position.left};` : '';
    const rightStyle = position.right ? `right: ${position.right};` : '';

    const script = `(function() {
  var buttonId = '${button.id}';
  var buttonLink = '${button.link_url}';
  
  // Criar estilos
  var style = document.createElement('style');
  style.textContent = '.chatbutton-${button.id}{position:fixed;${topStyle}${bottomStyle}${leftStyle}${rightStyle}width:60px;height:60px;background:linear-gradient(135deg,#25D366 0%,#128C7E 100%);border-radius:50%;box-shadow:0 4px 12px rgba(37,211,102,0.4);cursor:pointer;z-index:9999;display:flex;align-items:center;justify-content:center;transition:all 0.3s ease;animation:chatbutton-pulse-${button.id} 2s infinite}.chatbutton-${button.id}:hover{transform:scale(1.1);box-shadow:0 6px 20px rgba(37,211,102,0.6)}.chatbutton-${button.id} svg{width:32px;height:32px;fill:white}@keyframes chatbutton-pulse-${button.id}{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}';
  document.head.appendChild(style);
  
  // Criar botão
  var btn = document.createElement('a');
  btn.href = buttonLink;
  btn.target = '_blank';
  btn.rel = 'noopener noreferrer';
  btn.className = 'chatbutton-${button.id}';
  btn.setAttribute('data-chatbutton-id', buttonId);
  btn.innerHTML = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" fill="white"/></svg>';
  
  // Adicionar ao body
  if(document.body){document.body.appendChild(btn);}else{window.addEventListener('DOMContentLoaded',function(){document.body.appendChild(btn);});}
})();`;

    res.setHeader('Content-Type', 'application/javascript');
    res.send(script);
  } catch (error) {
    console.error('Script generation error:', error);
    res.status(500).json({ error: 'Erro ao gerar script' });
  }
});

export default router;

