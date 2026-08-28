import type { Request, Response } from 'express'
import { requireUsuarioId } from '../helpers/usuarioScope.js'
import Adulto from '../model/Adulto.js'
import Kids from '../model/Kids.js'

const AlunoController = {
  async index(req: Request, res: Response) {
    const usuarioId = requireUsuarioId(req, res)
    if (!usuarioId) return

    const [adultos, kids] = await Promise.all([
      Adulto.listarAdultos(usuarioId),
      Kids.listarKids(usuarioId)
    ])

    const alunos = [...adultos, ...kids]

    return res.json(alunos)
  },

  async show(req: Request, res: Response) {
    const usuarioId = requireUsuarioId(req, res)
    if (!usuarioId) return

    const id = req.params.id as string
    const [adulto, kid] = await Promise.all([
      Adulto.listarAdulto(id, usuarioId),
      Kids.listarKid(id, usuarioId)
    ])

    if (adulto) return res.json(adulto)
    if (kid) return res.json(kid)

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
          observacoes: payload.observacoes ?? ''
        }

        return res.status(201).json(await Kids.cadastrarKid(dados, usuarioId))
      }

      const dados = {
        nome: payload.nome,
        cpf: payload.cpf,
        dataNascimento: payload.dataNascimento,
        email: payload.email ?? '',
        telefone: payload.telefone ?? '',
        endereco: payload.endereco ?? '',
        graduacaoAtual: payload.graduacaoAtual ?? 'Branca',
        observacoes: payload.observacoes ?? ''
      }

      return res.status(201).json(await Adulto.cadastrarAdulto(dados, usuarioId))
    } catch (error: any) {
      console.error('AlunoController.create error:', error)
      return res.status(500).json({ error: 'Erro interno ao criar aluno', message: error?.message ?? String(error) })
    }
  }
}

export default AlunoController
