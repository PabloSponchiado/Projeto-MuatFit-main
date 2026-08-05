import type { Request, Response } from 'express'
import { DatabaseModel } from '../model/DatabaseModel.ts'
const pool = new DatabaseModel().pool

const AdultoController = {
  async index(req: Request, res: Response) {
    const result = await pool.query('SELECT * FROM adultos ORDER BY id')
    return res.json(result.rows)
  },
  async show(req: Request, res: Response) {
    const { id } = req.params
    const result = await pool.query('SELECT * FROM adultos WHERE id = $1', [id])
    if (result.rowCount === 0) return res.status(404).json({ error: 'Not found' })
    return res.json(result.rows[0])
  },
  async create(req: Request, res: Response) {
    const { nome, cpf, dataNascimento, email, telefone, endereco, graduacaoAtual, observacoes } = req.body
    const result = await pool.query(
      `INSERT INTO adultos (nome, cpf, data_nascimento, email, telefone, endereco, graduacao_atual, observacoes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [nome, cpf, dataNascimento, email, telefone, endereco, graduacaoAtual, observacoes]
    )
    return res.status(201).json(result.rows[0])
  },
  async delete(req: Request, res: Response) {
    const { id } = req.params
    await pool.query('DELETE FROM adultos WHERE id = $1', [id])
    return res.status(204).send()
  }
}

export default AdultoController
