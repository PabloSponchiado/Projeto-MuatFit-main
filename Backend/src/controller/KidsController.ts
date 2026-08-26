import type { Request, Response } from 'express'
import { DatabaseModel } from '../model/DatabaseModel.js'
import { requireUsuarioId } from '../helpers/usuarioScope.js'

const pool = new DatabaseModel().pool

const KidsController = {
  async index(req: Request, res: Response) {
    const usuarioId = requireUsuarioId(req, res)
    if (!usuarioId) return

    const result = await pool.query('SELECT * FROM kids WHERE usuario_id = $1 ORDER BY id', [usuarioId])
    return res.json(result.rows)
  },
  async show(req: Request, res: Response) {
    const usuarioId = requireUsuarioId(req, res)
    if (!usuarioId) return

    const { id } = req.params
    const result = await pool.query('SELECT * FROM kids WHERE id = $1 AND usuario_id = $2', [id, usuarioId])
    if (result.rowCount === 0) return res.status(404).json({ error: 'Not found' })
    return res.json(result.rows[0])
  },
  async create(req: Request, res: Response) {
    const usuarioId = requireUsuarioId(req, res)
    if (!usuarioId) return

    const { nome, cpf, dataNascimento, email, telefone, endereco, graduacaoAtual, responsavel, telefoneResponsavel, observacoes } = req.body
    const result = await pool.query(
      `INSERT INTO kids (nome, cpf, data_nascimento, email, telefone, endereco, graduacao_atual, responsavel, telefone_responsavel, observacoes, usuario_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [nome, cpf, dataNascimento, email, telefone, endereco, graduacaoAtual, responsavel, telefoneResponsavel, observacoes, usuarioId]
    )
    return res.status(201).json(result.rows[0])
  },
  async delete(req: Request, res: Response) {
    const usuarioId = requireUsuarioId(req, res)
    if (!usuarioId) return

    const { id } = req.params
    const result = await pool.query('DELETE FROM kids WHERE id = $1 AND usuario_id = $2 RETURNING *', [id, usuarioId])
    if (result.rowCount === 0) return res.status(404).json({ error: 'Not found' })
    return res.status(204).send()
  }
}

export default KidsController
