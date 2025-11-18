# ChatButtons - MVP SaaS

Sistema completo para criação e gerenciamento de botões de chat flutuantes (WhatsApp e URLs customizadas).

## 🚀 Tecnologias

### Backend
- Node.js + Express
- SQLite (banco de dados)
- JWT (autenticação)
- Passport.js (Google OAuth)
- bcryptjs (hash de senhas)

### Frontend
- React + Vite
- React Router
- Axios
- CSS puro (sem frameworks)

## 📦 Instalação

### Backend

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas credenciais

# Iniciar servidor
npm run dev
```

O backend estará rodando em `http://localhost:5000`

### Frontend

```bash
cd frontend

# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```

O frontend estará rodando em `http://localhost:3000`

## 🔧 Configuração

### Variáveis de Ambiente (.env)

```env
PORT=5000
JWT_SECRET=seu-secret-jwt-aqui
GOOGLE_CLIENT_ID=seu-google-client-id
GOOGLE_CLIENT_SECRET=seu-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
FRONTEND_URL=http://localhost:3000
```

### Google OAuth Setup

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto
3. Ative a API "Google+ API"
4. Crie credenciais OAuth 2.0
5. Adicione URLs de redirecionamento autorizadas:
   - `http://localhost:5000/api/auth/google/callback`
6. Copie Client ID e Client Secret para o `.env`

## 📋 Funcionalidades

### ✅ Autenticação
- [x] Cadastro com email/senha
- [x] Login com email/senha
- [x] Login com Google OAuth
- [x] Proteção de rotas autenticadas

### ✅ Dashboard
- [x] Lista de botões do usuário
- [x] Criar novo botão
- [x] Editar botão existente
- [x] Excluir botão
- [x] Copiar código JavaScript

### ✅ Cadastro de Botão
- [x] Nome do botão
- [x] Tipo de link (URL ou WhatsApp)
- [x] Geração automática de link WhatsApp
- [x] Posição do botão (4 opções)

### ✅ Geração de Script
- [x] Código JavaScript dinâmico
- [x] Botão flutuante estilizado
- [x] Posicionamento configurável
- [x] Link em nova aba
- [x] Leve e sem dependências

## 🎨 Estrutura do Projeto

```
chatbuttons/
├── server.js              # Servidor principal
├── database/
│   └── db.js              # Configuração do banco
├── middleware/
│   └── auth.js            # Middleware de autenticação
├── routes/
│   ├── auth.js            # Rotas de autenticação
│   ├── buttons.js         # CRUD de botões
│   └── script.js          # Geração de script
├── frontend/
│   ├── src/
│   │   ├── pages/         # Páginas React
│   │   ├── components/    # Componentes
│   │   └── context/       # Context API
│   └── package.json
└── package.json
```

## 📝 API Endpoints

### Autenticação
- `POST /api/auth/register` - Registrar novo usuário
- `POST /api/auth/login` - Login
- `GET /api/auth/google` - Iniciar OAuth Google
- `GET /api/auth/google/callback` - Callback OAuth
- `GET /api/auth/me` - Verificar token

### Botões
- `GET /api/buttons` - Listar botões (autenticado)
- `GET /api/buttons/:id` - Obter botão (autenticado)
- `POST /api/buttons` - Criar botão (autenticado)
- `PUT /api/buttons/:id` - Atualizar botão (autenticado)
- `DELETE /api/buttons/:id` - Deletar botão (autenticado)

### Script
- `GET /api/script/:id` - Gerar código JavaScript

## 🚀 Uso do Script Gerado

Após criar um botão, copie o código fornecido e cole no seu site:

```html
<script src="https://seudominio.com/api/script/123"></script>
```

O script criará automaticamente um botão flutuante na posição configurada.

## 📄 Licença

Este é um projeto MVP para demonstração.

