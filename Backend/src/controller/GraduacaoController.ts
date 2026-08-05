import type { Request, Response } from 'express'
import { DatabaseModel } from '../model/DatabaseModel.ts'
const pool = new DatabaseModel().pool

const GraduacaoController = {
  async index(req: Request, res: Response) {
    const result = await pool.query('SELECT * FROM graduacoes ORDER BY id')
    return res.json(result.rows)
  },
  async create(req: Request, res: Response) {
    const { alunoId, alunoNome, nivelAnterior, nivelAtual, dataGraduacao, observacao, examinador } = req.body
    const result = await pool.query(
      `INSERT INTO graduacoes (aluno_id, aluno_nome, nivel_anterior, nivel_atual, data_graduacao, observacao, examinador)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [alunoId, alunoNome, nivelAnterior, nivelAtual, dataGraduacao, observacao, examinador]
    )
    return res.status(201).json(result.rows[0])
  },
  async show(req: Request, res: Response) {
    const { id } = req.params
    const result = await pool.query('SELECT * FROM graduacoes WHERE id = $1', [id])
    if (result.rowCount === 0) return res.status(404).json({ error: 'Not found' })
    return res.json(result.rows[0])
  },
  async delete(req: Request, res: Response) {
    const { id } = req.params
    await pool.query('DELETE FROM graduacoes WHERE id = $1', [id])
    return res.status(204).send()
  },
  async listByAluno(req: Request, res: Response) {
    const { id } = req.params
    const result = await pool.query('SELECT * FROM graduacoes WHERE aluno_id = $1 ORDER BY id', [id])
    return res.json(result.rows)
  }
}

export default GraduacaoController
