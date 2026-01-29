const express = require('express');
const routes = express.Router();
const multer = require('multer');

const multerConfig = require('./config/multer'); 
const upload = multer(multerConfig);

// Controllers
const PlanoController = require('../controllers/PlanoController');
const AlunoController = require('../controllers/AlunoController');
const FuncionarioController = require('../controllers/FuncionarioController');
const SessionController = require('../controllers/SessionController');
const RelatorioController = require('../controllers/RelatorioController');
const DashboardController = require('../controllers/DashboardController');
const AlunoFotoController = require('../controllers/AlunoFotoController');

// Middlewares
const authMiddleware = require('../middlewares/auth');
const roleMiddleware = require('../middlewares/roleMiddleware');

// =============================================================
// 1. ROTAS PÚBLICAS (Acesso Livre)
// =============================================================
routes.post('/login', SessionController.create);
routes.post('/funcionarios', FuncionarioController.create); // Cadastro inicial

// =============================================================
// 2. MIDDLEWARE GLOBAL DE AUTENTICAÇÃO
// A partir daqui, TODAS as rotas exigem que o usuário esteja logado
// =============================================================
routes.use(authMiddleware);

// =============================================================
// 3. ROTAS DE OPERAÇÃO (Qualquer funcionário logado)
// =============================================================

// Dashboard Geral
routes.get('/dashboard', AlunoController.dashboard); 

// Gestão de Alunos
routes.get('/alunos', AlunoController.index);
routes.post('/alunos', upload.single('foto'), AlunoController.create); 
routes.put('/alunos/:id', upload.single('foto'), AlunoController.update);
routes.delete('/alunos/:id', AlunoController.delete);
routes.post('/alunos/:id/renovar', AlunoController.renew);
routes.patch('/alunos/:id/foto', upload.single('foto'), AlunoFotoController.update);

// Planos e Relatórios Básicos
routes.get('/planos', PlanoController.index);
routes.get('/relatorios/inadimplentes', AlunoController.getInadimplentes);

// =============================================================
// 4. ROTAS ADMINISTRATIVAS (Somente Nível 'Gerente')
// =============================================================
routes.get('/dashboard/faturamento', roleMiddleware('Gerente'), DashboardController.faturamento);
routes.get('/relatorios/exportar', roleMiddleware('Gerente'), RelatorioController.exportarInadimplentes);
routes.get('/funcionarios', roleMiddleware('Gerente'), FuncionarioController.index);

// Apenas gerente pode criar ou deletar planos de preços
routes.post('/planos', roleMiddleware('Gerente'), PlanoController.create); 
routes.delete('/planos/:id', roleMiddleware('Gerente'), PlanoController.delete);

module.exports = routes;