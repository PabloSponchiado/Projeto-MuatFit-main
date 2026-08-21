import type { Request, Response } from 'express'
import { DatabaseModel } from '../model/DatabaseModel.js'
const pool = new DatabaseModel().pool

const KidsController = {
  async index(req: Request, res: Response) {
    const result = await pool.query('SELECT * FROM kids ORDER BY id')
    return res.json(result.rows)
  },
  async show(req: Request, res: Response) {
    const { id } = req.params
    const result = await pool.query('SELECT * FROM kids WHERE id = $1', [id])
    if (result.rowCount === 0) return res.status(404).json({ error: 'Not found' })
    return res.json(result.rows[0])
  },
  async create(req: Request, res: Response) {
    const { nome, cpf, dataNascimento, email, telefone, endereco, graduacaoAtual, responsavel, telefoneResponsavel, observacoes } = req.body
    const result = await pool.query(
      `INSERT INTO kids (nome, cpf, data_nascimento, email, telefone, endereco, graduacao_atual, responsavel, telefone_responsavel, observacoes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [nome, cpf, dataNascimento, email, telefone, endereco, graduacaoAtual, responsavel, telefoneResponsavel, observacoes]
    )
    return res.status(201).json(result.rows[0])
  },
  async delete(req: Request, res: Response) {
    const { id } = req.params
    await pool.query('DELETE FROM kids WHERE id = $1', [id])
    return res.status(204).send()
  }
}

export default KidsController
