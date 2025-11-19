import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Caminho do arquivo JSON (usar /tmp no Vercel, local em desenvolvimento)
const getDataPath = () => {
  if (process.env.VERCEL) {
    return '/tmp/chatbuttons-data.json';
  }
  return path.join(__dirname, '..', 'data', 'chatbuttons-data.json');
};

const ensureDataFile = () => {
  const dataPath = getDataPath();
  const dataDir = path.dirname(dataPath);
  
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  if (!fs.existsSync(dataPath)) {
    const initialData = {
      users: [],
      buttons: []
    };
    fs.writeFileSync(dataPath, JSON.stringify(initialData, null, 2));
  }
};

const readData = () => {
  ensureDataFile();
  const dataPath = getDataPath();
  try {
    const data = fs.readFileSync(dataPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { users: [], buttons: [] };
  }
};

const writeData = (data) => {
  ensureDataFile();
  const dataPath = getDataPath();
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
};

// Funções de usuário
export const dbGetUser = async (query, params = []) => {
  const data = readData();
  
  if (query.includes('WHERE email = ?')) {
    return data.users.find(u => u.email === params[0]) || null;
  }
  if (query.includes('WHERE google_id = ?')) {
    return data.users.find(u => u.google_id === params[0]) || null;
  }
  if (query.includes('WHERE id = ?')) {
    const id = parseInt(params[0]);
    return data.users.find(u => u.id === id) || null;
  }
  
  // Para queries com SELECT específico de campos
  if (query.includes('SELECT id, email, name, avatar_url FROM users WHERE id = ?')) {
    const id = parseInt(params[0]);
    const user = data.users.find(u => u.id === id);
    if (!user) return null;
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar_url: user.avatar_url
    };
  }
  
  return null;
};

export const dbAllUsers = async (query, params = []) => {
  const data = readData();
  return data.users;
};

export const dbCreateUser = async (userData) => {
  const data = readData();
  
  // Verificar se email já existe
  if (userData.email && data.users.find(u => u.email === userData.email)) {
    throw new Error('Email já cadastrado');
  }
  
  // Verificar se google_id já existe
  if (userData.google_id && data.users.find(u => u.google_id === userData.google_id)) {
    throw new Error('Google ID já cadastrado');
  }
  
  const newId = data.users.length > 0 
    ? Math.max(...data.users.map(u => u.id)) + 1 
    : 1;
  
  const newUser = {
    id: newId,
    email: userData.email,
    password: userData.password || null,
    name: userData.name,
    google_id: userData.google_id || null,
    avatar_url: userData.avatar_url || null,
    created_at: new Date().toISOString()
  };
  
  data.users.push(newUser);
  writeData(data);
  
  return { lastID: newId, changes: 1 };
};

export const dbUpdateUser = async (id, userData) => {
  const data = readData();
  const index = data.users.findIndex(u => u.id === id);
  
  if (index === -1) return { changes: 0 };
  
  data.users[index] = {
    ...data.users[index],
    ...userData
  };
  
  writeData(data);
  return { changes: 1 };
};

// Funções de botões
export const dbGetButton = async (query, params = []) => {
  const data = readData();
  
  if (query.includes('WHERE id = ?')) {
    const id = parseInt(params[0]);
    const button = data.buttons.find(b => b.id === id) || null;
    if (button && query.includes('AND user_id = ?')) {
      const userId = parseInt(params[1]);
      return button.user_id === userId ? button : null;
    }
    return button;
  }
  
  return null;
};

export const dbAllButtons = async (query, params = []) => {
  const data = readData();
  
  if (query.includes('WHERE user_id = ?')) {
    const userId = parseInt(params[0]);
    let buttons = data.buttons.filter(b => b.user_id === userId);
    
    if (query.includes('ORDER BY created_at DESC')) {
      buttons.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
    
    return buttons;
  }
  
  return data.buttons;
};

export const dbCreateButton = async (buttonData) => {
  const data = readData();
  const newId = data.buttons.length > 0 
    ? Math.max(...data.buttons.map(b => b.id)) + 1 
    : 1;
  
  const newButton = {
    id: newId,
    user_id: parseInt(buttonData.user_id),
    name: buttonData.name,
    link_type: buttonData.link_type,
    link_url: buttonData.link_url,
    whatsapp_ddd: buttonData.whatsapp_ddd,
    whatsapp_number: buttonData.whatsapp_number,
    position: buttonData.position || 'bottom-right',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  data.buttons.push(newButton);
  writeData(data);
  
  return { lastID: newId, changes: 1 };
};

export const dbUpdateButton = async (id, userId, buttonData) => {
  const data = readData();
  const buttonId = parseInt(id);
  const user = parseInt(userId);
  const index = data.buttons.findIndex(b => b.id === buttonId && b.user_id === user);
  
  if (index === -1) return { changes: 0 };
  
  data.buttons[index] = {
    ...data.buttons[index],
    ...buttonData,
    updated_at: new Date().toISOString()
  };
  
  writeData(data);
  return { changes: 1 };
};

export const dbDeleteButton = async (id, userId) => {
  const data = readData();
  const initialLength = data.buttons.length;
  const buttonId = parseInt(id);
  const user = parseInt(userId);
  
  data.buttons = data.buttons.filter(b => !(b.id === buttonId && b.user_id === user));
  
  const deleted = initialLength !== data.buttons.length;
  if (deleted) {
    writeData(data);
  }
  
  return { changes: deleted ? 1 : 0 };
};

// Compatibilidade com código existente
export const dbGet = async (query, params = []) => {
  if (query.includes('FROM users')) {
    return await dbGetUser(query, params);
  }
  if (query.includes('FROM buttons')) {
    return await dbGetButton(query, params);
  }
  return null;
};

export const dbAll = async (query, params = []) => {
  if (query.includes('FROM users')) {
    return await dbAllUsers(query, params);
  }
  if (query.includes('FROM buttons')) {
    return await dbAllButtons(query, params);
  }
  return [];
};

export const dbRun = async (query, params = []) => {
  if (query.includes('INSERT INTO users')) {
    const userData = {};
    
    // Parse baseado na ordem dos campos na query
    if (query.includes('(email, password, name)')) {
      userData.email = params[0];
      userData.password = params[1];
      userData.name = params[2];
    } else if (query.includes('(email, name, google_id, avatar_url)')) {
      userData.email = params[0];
      userData.name = params[1];
      userData.google_id = params[2];
      userData.avatar_url = params[3];
    }
    
    return await dbCreateUser(userData);
  }
  
  if (query.includes('INSERT INTO buttons')) {
    const buttonData = {
      user_id: params[0],
      name: params[1],
      link_type: params[2],
      link_url: params[3],
      whatsapp_ddd: params[4],
      whatsapp_number: params[5],
      position: params[6] || 'bottom-right'
    };
    
    return await dbCreateButton(buttonData);
  }
  
  if (query.includes('UPDATE buttons')) {
    // Parâmetros na ordem: name, link_type, link_url, whatsapp_ddd, whatsapp_number, position, id, user_id
    const id = parseInt(params[6]);
    const userId = parseInt(params[7]);
    
    const buttonData = {
      name: params[0],
      link_type: params[1],
      link_url: params[2],
      whatsapp_ddd: params[3],
      whatsapp_number: params[4],
      position: params[5]
    };
    
    return await dbUpdateButton(id, userId, buttonData);
  }
  
  if (query.includes('DELETE FROM buttons')) {
    return await dbDeleteButton(params[0], params[1]);
  }
  
  return { lastID: 0, changes: 0 };
};

export const initDatabase = async () => {
  ensureDataFile();
  console.log('✅ JSON database initialized');
  return Promise.resolve();
};
