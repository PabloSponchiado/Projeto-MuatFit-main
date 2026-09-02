import type { Request, Response } from 'express'
import { requireUsuarioId } from '../helpers/usuarioScope.js'
import Kids from '../model/Kids.js'

const KidsController = {
  async index(req: Request, res: Response) {
    const usuarioId = requireUsuarioId(req, res)
    if (!usuarioId) return

    return res.json(await Kids.listarKids(usuarioId))
  },
  async show(req: Request, res: Response) {
    const usuarioId = requireUsuarioId(req, res)
    if (!usuarioId) return

    const id = req.params.id as string
    const kid = await Kids.listarKid(id, usuarioId)
    if (!kid) return res.status(404).json({ error: 'Not found' })
    return res.json(kid)
  },
  async create(req: Request, res: Response) {
    try {
      const usuarioId = requireUsuarioId(req, res)
      if (!usuarioId) return

      const kid = await Kids.cadastrarKid({ ...req.body, imagemPerfil: req.file?.filename }, usuarioId)
      return res.status(201).json(kid)
    } catch (error: any) {
      console.error('KidsController.create error:', error)
      return res.status(500).json({ error: 'Erro interno ao criar kid', message: error?.message ?? String(error) })
    }
  },
  async delete(req: Request, res: Response) {
    const usuarioId = requireUsuarioId(req, res)
    if (!usuarioId) return

    const id = req.params.id as string
    const removido = await Kids.removerKid(id, usuarioId)
    if (!removido) return res.status(404).json({ error: 'Not found' })
    return res.status(204).send()
  },
  async update(req: Request, res: Response) {
    const usuarioId = requireUsuarioId(req, res)
    if (!usuarioId) return
    try {
      const kid = await Kids.atualizarKid(req.params.id as string, req.body, usuarioId, req.file?.filename)
      if (!kid) return res.status(404).json({ error: 'Not found' })
      return res.json(kid)
    } catch (error: any) {
      return res.status(500).json({ error: 'Erro interno ao atualizar kid', message: error?.message ?? String(error) })
    }
  }
}

export default KidsController
