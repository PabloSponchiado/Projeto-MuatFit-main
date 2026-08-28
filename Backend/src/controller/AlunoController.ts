import type { Request, Response } from 'express'
import { DatabaseModel } from '../model/DatabaseModel.js'
import { requireUsuarioId } from '../helpers/usuarioScope.js'

const pool = new DatabaseModel().pool

const normalizarAluno = (aluno: any, categoria: 'ADULTO' | 'KIDS') => ({
  ...aluno,
  categoria,
  graduacaoAtual: aluno.graduacao_atual ?? aluno.graduacaoAtual ?? 'Branca',
  dataNascimento: aluno.data_nascimento ?? aluno.dataNascimento ?? null,
  telefoneResponsavel: aluno.telefone_responsavel ?? aluno.telefoneResponsavel ?? null,
  responsavel: aluno.responsavel ?? null
})

const AlunoController = {
  async index(req: Request, res: Response) {
    const usuarioId = requireUsuarioId(req, res)
    if (!usuarioId) return

    const [adultos, kids] = await Promise.all([
      pool.query('SELECT * FROM adultos WHERE usuario_id = $1 ORDER BY id', [usuarioId]),
      pool.query('SELECT * FROM kids WHERE usuario_id = $1 ORDER BY id', [usuarioId])
    ])

    const alunos = [
      ...adultos.rows.map((aluno) => normalizarAluno(aluno, 'ADULTO')),
      ...kids.rows.map((aluno) => normalizarAluno(aluno, 'KIDS'))
    ]

    return res.json(alunos)
  },

  async show(req: Request, res: Response) {
    const usuarioId = requireUsuarioId(req, res)
    if (!usuarioId) return

    const { id } = req.params

    const [adulto, kid] = await Promise.all([
      pool.query('SELECT * FROM adultos WHERE id = $1 AND usuario_id = $2 LIMIT 1', [id, usuarioId]),
      pool.query('SELECT * FROM kids WHERE id = $1 AND usuario_id = $2 LIMIT 1', [id, usuarioId])
    ])

    if (adulto.rowCount && adulto.rowCount > 0) {
      return res.json(normalizarAluno(adulto.rows[0], 'ADULTO'))
    }

    if (kid.rowCount && kid.rowCount > 0) {
      return res.json(normalizarAluno(kid.rows[0], 'KIDS'))
    }

    return res.status(404).json({ error: 'Aluno não encontrado para este perfil.' })
  },

  async create(req: Request, res: Response) {
    try {
      const usuarioId = requireUsuarioId(req, res)
      if (!usuarioId) return

      const categoria = String(req.body?.categoria ?? 'ADULTO').toUpperCase()
      const payload = req.body ?? {}

      if (categoria === 'KIDS') {
        const dados = {
          nome: payload.nome,
          cpf: payload.cpf,
          dataNascimento: payload.dataNascimento,
          email: payload.email ?? '',
          telefone: payload.telefone ?? '',
          endereco: payload.endereco ?? '',
          graduacaoAtual: payload.graduacaoAtual ?? 'Branca',
          responsavel: payload.responsavel ?? '',
          telefoneResponsavel: payload.telefoneResponsavel ?? '',
          observacoes: payload.observacoes ?? '',
          usuario_id: usuarioId
        }

        const result = await pool.query(
          `INSERT INTO kids (nome, cpf, data_nascimento, email, telefone, endereco, graduacao_atual, responsavel, telefone_responsavel, observacoes, usuario_id)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
          [dados.nome, dados.cpf, dados.dataNascimento, dados.email, dados.telefone, dados.endereco, dados.graduacaoAtual, dados.responsavel, dados.telefoneResponsavel, dados.observacoes, dados.usuario_id]
        )

        return res.status(201).json(normalizarAluno(result.rows[0], 'KIDS'))
      }

      const dados = {
        nome: payload.nome,
        cpf: payload.cpf,
        dataNascimento: payload.dataNascimento,
        email: payload.email ?? '',
        telefone: payload.telefone ?? '',
        endereco: payload.endereco ?? '',
        graduacaoAtual: payload.graduacaoAtual ?? 'Branca',
        observacoes: payload.observacoes ?? '',
        usuario_id: usuarioId
      }

      const result = await pool.query(
        `INSERT INTO adultos (nome, cpf, data_nascimento, email, telefone, endereco, graduacao_atual, observacoes, usuario_id)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
        [dados.nome, dados.cpf, dados.dataNascimento, dados.email, dados.telefone, dados.endereco, dados.graduacaoAtual, dados.observacoes, dados.usuario_id]
      )

      return res.status(201).json(normalizarAluno(result.rows[0], 'ADULTO'))
    } catch (error: any) {
      console.error('AlunoController.create error:', error)
      return res.status(500).json({ error: 'Erro interno ao criar aluno', message: error?.message ?? String(error) })
    }
  }
}

export default AlunoController
