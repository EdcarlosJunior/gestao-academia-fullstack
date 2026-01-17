const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const path = require('path');


// ... suas rotas abaixo
// ADICIONE ESTA LINHA: Garante que o database.js seja lido e execute o setupDatabase()
require('./database/database'); 

const app = express();

app.use(cors()); // 3. AGORA SIM: Usa o cors

app.use(express.json());

app.use('/files', express.static(path.resolve(__dirname,'uploads')));

app.post('/teste-direto', (req, res) => {
  return res.status(201).json({ message: 'Se você ver isso, o erro está nas rotas!' });
});



// Log global para diagnóstico de requisições
app.use((req, res, next) => {
  console.log(`[server] ${req.method} ${req.path} - headers.authorization: ${req.headers.authorization ? '[present]' : '[missing]'}`);
  next();
});

// Rota de teste rápido (bom deixar antes das rotas principais)
app.get('/healthcheck', (req, res) => {
  return res.json({ status: 'ok', message: 'Servidor RCgym está online!' });
});

app.use(routes);

require('dotenv').config(); // Carrega o .env

const PORT = process.env.PORT || 3333; // Usa a porta do .env ou 3333 por segurança

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});