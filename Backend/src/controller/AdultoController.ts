import type { Request, Response } from 'express'
import { requireUsuarioId } from '../helpers/usuarioScope.js'
import Adulto from '../model/Adulto.js'

const AdultoController = {
  async index(req: Request, res: Response) {
    const usuarioId = requireUsuarioId(req, res)
    if (!usuarioId) return

    return res.json(await Adulto.listarAdultos(usuarioId))
  },
  async show(req: Request, res: Response) {
    const usuarioId = requireUsuarioId(req, res)
    if (!usuarioId) return

    const id = req.params.id as string
    const adulto = await Adulto.listarAdulto(id, usuarioId)
    if (!adulto) return res.status(404).json({ error: 'Not found' })
    return res.json(adulto)
  },
  async create(req: Request, res: Response) {
    try {
      const usuarioId = requireUsuarioId(req, res)
      if (!usuarioId) return

      const adulto = await Adulto.cadastrarAdulto({ ...req.body, imagemPerfil: req.file?.filename }, usuarioId)
      return res.status(201).json(adulto)
    } catch (error: any) {
      console.error('AdultoController.create error:', error)
      return res.status(500).json({ error: 'Erro interno ao criar adulto', message: error?.message ?? String(error) })
    }
  },
  async delete(req: Request, res: Response) {
    const usuarioId = requireUsuarioId(req, res)
    if (!usuarioId) return

    const id = req.params.id as string
    const removido = await Adulto.removerAdulto(id, usuarioId)
    if (!removido) return res.status(404).json({ error: 'Not found' })
    return res.status(204).send()
  },
  async update(req: Request, res: Response) {
    const usuarioId = requireUsuarioId(req, res)
    if (!usuarioId) return
    try {
      const adulto = await Adulto.atualizarAdulto(req.params.id as string, req.body, usuarioId, req.file?.filename)
      if (!adulto) return res.status(404).json({ error: 'Not found' })
      return res.json(adulto)
    } catch (error: any) {
      return res.status(500).json({ error: 'Erro interno ao atualizar adulto', message: error?.message ?? String(error) })
    }
  }
}

export default AdultoController
