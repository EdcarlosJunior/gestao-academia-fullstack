const express = require('express');
const routes = express.Router();
const multer = require('multer');
const path = require('path');

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
// Organizadas para que o Dashboard e o CRUD de Alunos funcionem sem travas
// =============================================================

routes.post('/login', SessionController.create);
routes.post('/funcionarios', FuncionarioController.create); 

// NOVIDADE: Movida para o topo das públicas para garantir o carregamento dos cards
routes.get('/dashboard', AlunoController.dashboard); 

// Rotas de Alunos
routes.get('/alunos', AlunoController.index);
routes.post('/alunos', upload.single('foto'), AlunoController.create); 
routes.put('/alunos/:id', upload.single('foto'), AlunoController.update);
routes.delete('/alunos/:id', AlunoController.delete);
routes.post('/alunos/:id/renovar', AlunoController.renew);

// Rotas de Planos
routes.get('/planos', PlanoController.index);
routes.post('/planos', PlanoController.create); 

// =============================================================
// 2. ROTAS PROTEGIDAS (Exigem Token JWT / Nível Gerente)
// =============================================================

// Foto específica (usa auth)
routes.patch('/alunos/:id/foto', authMiddleware, upload.single('foto'), AlunoFotoController.update);

// Relatórios
routes.get('/relatorios/inadimplentes', authMiddleware, AlunoController.getInadimplentes);

// Administrativo (Gerente)
routes.get('/dashboard/faturamento', authMiddleware, roleMiddleware('Gerente'), DashboardController.faturamento);
routes.get('/relatorios/exportar', authMiddleware, roleMiddleware('Gerente'), RelatorioController.exportarInadimplentes);
routes.get('/funcionarios', authMiddleware, FuncionarioController.index);

routes.delete('/planos/:id', authMiddleware, PlanoController.delete);

module.exports = routes;