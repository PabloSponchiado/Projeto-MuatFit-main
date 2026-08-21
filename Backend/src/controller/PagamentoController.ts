import type { Request, Response } from 'express'
import { DatabaseModel } from '../model/DatabaseModel.js'
const pool = new DatabaseModel().pool

const PagamentoController = {
  async index(req: Request, res: Response) {
    const result = await pool.query('SELECT * FROM pagamentos ORDER BY id')
    return res.json(result.rows)
  },
  async create(req: Request, res: Response) {
    const { alunoId, alunoNome, valor, dataVencimento, dataPagamento, status, mes, ano, observacao } = req.body
    const statusFinal = status ?? 'PENDENTE'

    const result = await pool.query(
      `INSERT INTO pagamentos (aluno_id, aluno_nome, valor, data_vencimento, data_pagamento, status, mes, ano, observacao)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [alunoId, alunoNome, valor, dataVencimento, dataPagamento ?? null, statusFinal, mes, ano, observacao]
    )
    return res.status(201).json(result.rows[0])
  },
  async show(req: Request, res: Response) {
    const { id } = req.params
    const result = await pool.query('SELECT * FROM pagamentos WHERE id = $1', [id])
    if (result.rowCount === 0) return res.status(404).json({ error: 'Not found' })
    return res.json(result.rows[0])
  },
  async confirm(req: Request, res: Response) {
    const { id } = req.params
    const result = await pool.query(
      "UPDATE pagamentos SET status = 'PAGO', data_pagamento = CURRENT_DATE WHERE id = $1 RETURNING *",
      [id]
    )

    if (result.rowCount === 0) return res.status(404).json({ error: 'Not found' })
    return res.json(result.rows[0])
  },
  async delete(req: Request, res: Response) {
    const { id } = req.params
    await pool.query('DELETE FROM pagamentos WHERE id = $1', [id])
    return res.status(204).send()
  },
  async listByAluno(req: Request, res: Response) {
    const { id } = req.params
    const result = await pool.query('SELECT * FROM pagamentos WHERE aluno_id = $1 ORDER BY id', [id])
    return res.json(result.rows)
  }
}

export default PagamentoController
