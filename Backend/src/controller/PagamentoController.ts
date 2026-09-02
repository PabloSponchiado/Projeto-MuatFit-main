import type { Request, Response } from 'express'
import { requireUsuarioId } from '../helpers/usuarioScope.js'
import Pagamento from '../model/Pagamento.js'

const PagamentoController = {
  async index(req: Request, res: Response) {
    const usuarioId = requireUsuarioId(req, res)
    if (!usuarioId) return

    return res.json(await Pagamento.listarPagamentos(usuarioId))
  },
  async create(req: Request, res: Response) {
    const usuarioId = requireUsuarioId(req, res)
    if (!usuarioId) return

    try {
      const pagamento = await Pagamento.cadastrarPagamento(req.body, usuarioId)
      return res.status(201).json(pagamento)
    } catch (error) {
      if (error instanceof Error && error.message === 'ALUNO_FORA_DO_USUARIO') {
        return res.status(403).json({ error: 'Você não pode registrar pagamento para um aluno que não pertence ao seu perfil.' })
      }
      throw error
    }
  },
  async show(req: Request, res: Response) {
    const usuarioId = requireUsuarioId(req, res)
    if (!usuarioId) return

    const id = req.params.id as string
    const pagamento = await Pagamento.listarPagamento(id, usuarioId)
    if (!pagamento) return res.status(404).json({ error: 'Not found' })
    return res.json(pagamento)
  },
  async confirm(req: Request, res: Response) {
    const usuarioId = requireUsuarioId(req, res)
    if (!usuarioId) return

    const id = req.params.id as string
    const pagamento = await Pagamento.confirmarPagamento(id, usuarioId)
    if (!pagamento) return res.status(404).json({ error: 'Not found' })
    return res.json(pagamento)
  },
  async delete(req: Request, res: Response) {
    const usuarioId = requireUsuarioId(req, res)
    if (!usuarioId) return

    const id = req.params.id as string
    const removido = await Pagamento.removerPagamento(id, usuarioId)
    if (!removido) return res.status(404).json({ error: 'Not found' })
    return res.status(204).send()
  },
  async listByAluno(req: Request, res: Response) {
    const usuarioId = requireUsuarioId(req, res)
    if (!usuarioId) return

    const id = req.params.id as string
    return res.json(await Pagamento.listarPagamentosPorAluno(id, usuarioId))
  }
}

export default PagamentoController
