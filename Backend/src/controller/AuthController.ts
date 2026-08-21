import type { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { DatabaseModel } from '../model/DatabaseModel.js'

const pool = new DatabaseModel().pool

const AuthController = {
  async login(req: Request, res: Response) {
    const email = String(req.body?.email ?? '').trim().toLowerCase()
    const senha = String(req.body?.senha ?? '').trim()

    if (!email || !senha) return res.status(400).json({ error: 'email and senha required' })

    try {
      const tables = ['usuario', 'usuarios']
      let usuario: any = null

      for (const table of tables) {
        const result = await pool.query(`SELECT * FROM ${table} WHERE email = $1 LIMIT 1`, [email])
        if (result.rowCount && result.rowCount > 0) {
          usuario = result.rows[0]
          break
        }
      }

      if (!usuario) return res.status(401).json({ error: 'Invalid credentials' })

      if (String(usuario.senha) !== senha) return res.status(401).json({ error: 'Invalid credentials' })

      const idUsuario = usuario.id_usuario ?? usuario.id ?? usuario.idUsuario
      const nomeUsuario = usuario.nome ?? 'Usuário'
      const emailUsuario = usuario.email ?? email
      const roleUsuario = usuario.role ?? 'ADMIN'
      const academiaUsuario = usuario.academia ?? null

      const token = jwt.sign({ id: idUsuario, email: emailUsuario, role: roleUsuario }, 'muayfit2026', { expiresIn: '8h' })

      return res.json({
        id: idUsuario,
        nome: nomeUsuario,
        email: emailUsuario,
        role: roleUsuario,
        academia: academiaUsuario,
        token
      })
    } catch (error) {
      console.error('Erro ao autenticar usuário:', error)
      return res.status(500).json({ error: 'Erro interno ao autenticar usuário' })
    }
  },

  async register(req: Request, res: Response) {
    const nome = String(req.body?.nome ?? '').trim()
    const email = String(req.body?.email ?? '').trim().toLowerCase()
    const senha = String(req.body?.senha ?? '').trim()
    const academia = String(req.body?.academia ?? '').trim() || 'Minha Academia'

    if (!nome || !email || !senha) {
      return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' })
    }

    try {
      const existente = await pool.query('SELECT id_usuario FROM usuario WHERE email = $1 LIMIT 1', [email])
      if (existente.rowCount && existente.rowCount > 0) {
        return res.status(409).json({ error: 'Já existe uma conta com este e-mail' })
      }

      const result = await pool.query(
        'INSERT INTO usuario (nome, email, senha, role, academia) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [nome, email, senha, 'ADMIN', academia]
      )

      const usuario = result.rows[0]
      const token = jwt.sign({ id: usuario.id_usuario, email: usuario.email, role: usuario.role }, 'muayfit2026', { expiresIn: '8h' })

      return res.status(201).json({
        id: usuario.id_usuario,
        nome: usuario.nome,
        email: usuario.email,
        role: usuario.role,
        academia: usuario.academia,
        token
      })
    } catch (error) {
      console.error('Erro ao cadastrar usuário:', error)
      return res.status(500).json({ error: 'Erro interno ao cadastrar usuário' })
    }
  }
}

export default AuthController
