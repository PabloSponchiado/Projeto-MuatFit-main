import { Router, type Request, type Response } from "express";
import AlunoController from './controller/AlunoController.js'
import AdultoController from './controller/AdultoController.js'
import KidsController from './controller/KidsController.js'
import GraduacaoController from './controller/GraduacaoController.js'
import PagamentoController from './controller/PagamentoController.js'
import AuthController from './controller/AuthController.js'
import UsuarioController from './controller/UsuarioController.js'
import upload from './Config/multerConfig.js'
import auth from './middleware/Auth.js'

const router = Router();
const SERVER_ROUTES = {
    NOVO_USUARIO: '/api/usuarios'
} as const;

// ==================== HEALTH CHECK ====================

router.get('/', (req: Request, res: Response) => {
    res.status(200).json({ mensagem: "Aplicação online.", timestamp: new Date() });
});
// Auth
router.post('/api/login', AuthController.login)
router.post('/api/register', upload.single('imagemPerfil'), AuthController.register)
router.patch('/api/usuarios/perfil', auth, upload.single('imagemPerfil'), AuthController.updateProfile)
router.post(SERVER_ROUTES.NOVO_USUARIO, upload.single('imagemPerfil'), UsuarioController.cadastrar)

// Alunos (frontend usa endpoints separados para adultos e kids)
router.get('/api/adultos', auth, AdultoController.index)
router.get('/api/adultos/:id', auth, AdultoController.show)
router.post('/api/adultos', auth, upload.single('imagemPerfil'), AdultoController.create)
router.patch('/api/adultos/:id', auth, upload.single('imagemPerfil'), AdultoController.update)
router.delete('/api/adultos/:id', auth, AdultoController.delete)

router.get('/api/kids', auth, KidsController.index)
router.get('/api/kids/:id', auth, KidsController.show)
router.post('/api/kids', auth, upload.single('imagemPerfil'), KidsController.create)
router.patch('/api/kids/:id', auth, upload.single('imagemPerfil'), KidsController.update)
router.delete('/api/kids/:id', auth, KidsController.delete)

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
router.get('/api/alunos', auth, AlunoController.index)
router.get('/api/alunos/:id', auth, AlunoController.show)

export { router };
