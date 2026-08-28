import type { Request, Response } from 'express'
import { requireUsuarioId } from '../helpers/usuarioScope.js'
import Graduacao from '../model/Graduacao.js'

const GraduacaoController = {
  async index(req: Request, res: Response) {
    const usuarioId = requireUsuarioId(req, res)
    if (!usuarioId) return

    return res.json(await Graduacao.listarGraduacoes(usuarioId))
  },
  async create(req: Request, res: Response) {
    const usuarioId = requireUsuarioId(req, res)
    if (!usuarioId) return

    try {
      const graduacao = await Graduacao.cadastrarGraduacao(req.body, usuarioId)
      return res.status(201).json(graduacao)
    } catch (error) {
      if (error instanceof Error && error.message === 'ALUNO_FORA_DO_USUARIO') {
        return res.status(403).json({ error: 'Você não pode cadastrar graduação para um aluno que não pertence ao seu perfil.' })
      }
      throw error
    }
  },
  async show(req: Request, res: Response) {
    const usuarioId = requireUsuarioId(req, res)
    if (!usuarioId) return

    const id = req.params.id as string
    const graduacao = await Graduacao.listarGraduacao(id, usuarioId)
    if (!graduacao) return res.status(404).json({ error: 'Not found' })
    return res.json(graduacao)
  },
  async delete(req: Request, res: Response) {
    const usuarioId = requireUsuarioId(req, res)
    if (!usuarioId) return

    const id = req.params.id as string
    const removido = await Graduacao.removerGraduacao(id, usuarioId)
    if (!removido) return res.status(404).json({ error: 'Not found' })
    return res.status(204).send()
  },
  async listByAluno(req: Request, res: Response) {
    const usuarioId = requireUsuarioId(req, res)
    if (!usuarioId) return

    const id = req.params.id as string
    return res.json(await Graduacao.listarGraduacoesPorAluno(id, usuarioId))
  }
}

export default GraduacaoController
