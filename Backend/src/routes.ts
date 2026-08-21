import { Router, type Request, type Response } from "express";
import { Auth } from "./middleware/Auth.js";
import AlunoController from './controller/AlunoController.js'
import AdultoController from './controller/AdultoController.js'
import KidsController from './controller/KidsController.js'
import GraduacaoController from './controller/GraduacaoController.js'
import PagamentoController from './controller/PagamentoController.js'
import AuthController from './controller/AuthController.js'
import auth from './middleware/Auth.js'

const router = Router();

// ==================== HEALTH CHECK ====================

router.get('/', (req: Request, res: Response) => {
    res.status(200).json({ mensagem: "Aplicação online.", timestamp: new Date() });
});
// Auth
router.post('/api/login', AuthController.login)

// Alunos (frontend usa endpoints separados para adultos e kids)
router.get('/api/adultos', AdultoController.index)
router.get('/api/adultos/:id', AdultoController.show)
router.post('/api/adultos', AdultoController.create)
router.delete('/api/adultos/:id', AdultoController.delete)

router.get('/api/kids', KidsController.index)
router.get('/api/kids/:id', KidsController.show)
router.post('/api/kids', KidsController.create)
router.delete('/api/kids/:id', KidsController.delete)

// Graduacoes
router.get('/api/graduacoes', auth, GraduacaoController.index)
router.post('/api/graduacoes', auth, GraduacaoController.create)
router.get('/api/graduacoes/:id', auth, GraduacaoController.show)
router.delete('/api/graduacoes/:id', auth, GraduacaoController.delete)
router.get('/api/alunos/:id/graduacoes', auth, GraduacaoController.listByAluno)

// Pagamentos
router.get('/api/pagamentos', auth, PagamentoController.index)
router.post('/api/pagamentos', auth, PagamentoController.create)
router.get('/api/pagamentos/:id', auth, PagamentoController.show)
router.patch('/api/pagamentos/:id/confirmar', auth, PagamentoController.confirm)
router.delete('/api/pagamentos/:id', auth, PagamentoController.delete)
router.get('/api/alunos/:id/pagamentos', auth, PagamentoController.listByAluno)

// generic alunos endpoint used in some frontend requests
router.get('/api/alunos', AlunoController.index)

export { router };
