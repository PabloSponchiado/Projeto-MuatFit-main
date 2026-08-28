import type { Request, Response } from 'express'
import { DatabaseModel } from '../model/DatabaseModel.js'
import { requireUsuarioId } from '../helpers/usuarioScope.js'

const pool = new DatabaseModel().pool

const ensureAlunoPertenceAoUsuario = async (alunoId: string | number, usuarioId: number) => {
  const [alunoAdulto, alunoKids] = await Promise.all([
    pool.query('SELECT id FROM adultos WHERE id = $1 AND usuario_id = $2 LIMIT 1', [alunoId, usuarioId]),
    pool.query('SELECT id FROM kids WHERE id = $1 AND usuario_id = $2 LIMIT 1', [alunoId, usuarioId])
  ])

  return Boolean(alunoAdulto.rowCount && alunoAdulto.rowCount > 0) || Boolean(alunoKids.rowCount && alunoKids.rowCount > 0)
}

const PagamentoController = {
  async index(req: Request, res: Response) {
    const usuarioId = requireUsuarioId(req, res)
    if (!usuarioId) return

    const result = await pool.query('SELECT * FROM pagamentos WHERE usuario_id = $1 ORDER BY id', [usuarioId])
    return res.json(result.rows)
  },
  async create(req: Request, res: Response) {
    const usuarioId = requireUsuarioId(req, res)
    if (!usuarioId) return

    const { alunoId, alunoNome, valor, dataVencimento, dataPagamento, status, mes, ano, observacao } = req.body
    const statusFinal = status ?? 'PENDENTE'

    const alunoValido = await ensureAlunoPertenceAoUsuario(alunoId, usuarioId)
    if (!alunoValido) {
      return res.status(403).json({ error: 'Você não pode registrar pagamento para um aluno que não pertence ao seu perfil.' })
    }

    const result = await pool.query(
      `INSERT INTO pagamentos (aluno_id, aluno_nome, valor, data_vencimento, data_pagamento, status, mes, ano, observacao, usuario_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [alunoId, alunoNome, valor, dataVencimento, dataPagamento ?? null, statusFinal, mes, ano, observacao, usuarioId]
    )
    return res.status(201).json(result.rows[0])
  },
  async show(req: Request, res: Response) {
    const usuarioId = requireUsuarioId(req, res)
    if (!usuarioId) return

    const { id } = req.params
    const result = await pool.query('SELECT * FROM pagamentos WHERE id = $1 AND usuario_id = $2', [id, usuarioId])
    if (result.rowCount === 0) return res.status(404).json({ error: 'Not found' })
    return res.json(result.rows[0])
  },
  async confirm(req: Request, res: Response) {
    const usuarioId = requireUsuarioId(req, res)
    if (!usuarioId) return

    const { id } = req.params
    const result = await pool.query(
      "UPDATE pagamentos SET status = 'PAGO', data_pagamento = CURRENT_DATE WHERE id = $1 AND usuario_id = $2 RETURNING *",
      [id, usuarioId]
    )

    if (result.rowCount === 0) return res.status(404).json({ error: 'Not found' })
    return res.json(result.rows[0])
  },
  async delete(req: Request, res: Response) {
    const usuarioId = requireUsuarioId(req, res)
    if (!usuarioId) return

    const { id } = req.params
    const result = await pool.query('DELETE FROM pagamentos WHERE id = $1 AND usuario_id = $2 RETURNING *', [id, usuarioId])
    if (result.rowCount === 0) return res.status(404).json({ error: 'Not found' })
    return res.status(204).send()
  },
  async listByAluno(req: Request, res: Response) {
    const usuarioId = requireUsuarioId(req, res)
    if (!usuarioId) return

    const { id } = req.params
    const result = await pool.query(
      'SELECT * FROM pagamentos WHERE aluno_id = $1 AND usuario_id = $2 ORDER BY id',
      [id, usuarioId]
    )
    return res.json(result.rows)
  }
}

export default PagamentoController
