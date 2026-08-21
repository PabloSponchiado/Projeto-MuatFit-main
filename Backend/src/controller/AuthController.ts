import type { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { DatabaseModel } from '../model/DatabaseModel.js'

const pool = new DatabaseModel().pool

const AuthController = {
  async login(req: Request, res: Response) {
    const { email, senha } = req.body
    if (!email || !senha) return res.status(400).json({ error: 'email and senha required' })

    const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email])
    if (result.rowCount === 0) return res.status(401).json({ error: 'Invalid credentials' })
    const usuario = result.rows[0]
    // para esqueleto, aceitamos senha em texto (trocar por hash em produção)
    if (usuario.senha !== senha) return res.status(401).json({ error: 'Invalid credentials' })

    const token = jwt.sign({ id: usuario.id, email: usuario.email, role: usuario.role }, 'muayfit2026', { expiresIn: '8h' })
    return res.json({ id: usuario.id, nome: usuario.nome, email: usuario.email, role: usuario.role, academia: usuario.academia, token })
  }
}

export default AuthController
