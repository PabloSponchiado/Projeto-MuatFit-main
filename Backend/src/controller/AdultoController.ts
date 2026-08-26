import type { Request, Response } from 'express'
import { DatabaseModel } from '../model/DatabaseModel.js'
import { requireUsuarioId } from '../helpers/usuarioScope.js'

const pool = new DatabaseModel().pool

const AdultoController = {
  async index(req: Request, res: Response) {
    const usuarioId = requireUsuarioId(req, res)
    if (!usuarioId) return

    const result = await pool.query('SELECT * FROM adultos WHERE usuario_id = $1 ORDER BY id', [usuarioId])
    return res.json(result.rows)
  },
  async show(req: Request, res: Response) {
    const usuarioId = requireUsuarioId(req, res)
    if (!usuarioId) return

    const { id } = req.params
    const result = await pool.query('SELECT * FROM adultos WHERE id = $1 AND usuario_id = $2', [id, usuarioId])
    if (result.rowCount === 0) return res.status(404).json({ error: 'Not found' })
    return res.json(result.rows[0])
  },
  async create(req: Request, res: Response) {
    const usuarioId = requireUsuarioId(req, res)
    if (!usuarioId) return

    const { nome, cpf, dataNascimento, email, telefone, endereco, graduacaoAtual, observacoes } = req.body
    const result = await pool.query(
      `INSERT INTO adultos (nome, cpf, data_nascimento, email, telefone, endereco, graduacao_atual, observacoes, usuario_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [nome, cpf, dataNascimento, email, telefone, endereco, graduacaoAtual, observacoes, usuarioId]
    )
    return res.status(201).json(result.rows[0])
  },
  async delete(req: Request, res: Response) {
    const usuarioId = requireUsuarioId(req, res)
    if (!usuarioId) return

    const { id } = req.params
    const result = await pool.query('DELETE FROM adultos WHERE id = $1 AND usuario_id = $2 RETURNING *', [id, usuarioId])
    if (result.rowCount === 0) return res.status(404).json({ error: 'Not found' })
    return res.status(204).send()
  }
}

export default AdultoController
