import type { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { DatabaseModel } from '../model/DatabaseModel.js'
import fs from 'fs'
import path from 'path'
import { Usuario } from '../model/Usuario.js'

const pool = new DatabaseModel().pool

const AuthController = {
  async login(req: Request, res: Response) {
    const email = String(req.body?.email ?? '').trim().toLowerCase()
    const senha = String(req.body?.senha ?? '').trim()

    if (!email || !senha) return res.status(400).json({ error: 'email and senha required' })

    try {
      const result = await pool.query('SELECT * FROM usuario WHERE email = $1 LIMIT 1', [email])
      const usuario = result.rows[0]

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
        imagemPerfil: usuario.imagem_perfil ?? '',
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
      if (req.file) {
        const extensao = path.extname(req.file.originalname)
        const nomeArquivo = `${usuario.id_usuario}${extensao}`
        fs.renameSync(req.file.path, path.resolve(req.file.destination, nomeArquivo))
        await pool.query('UPDATE usuario SET imagem_perfil = $1 WHERE id_usuario = $2', [nomeArquivo, usuario.id_usuario])
        usuario.imagem_perfil = nomeArquivo
      }
      const token = jwt.sign({ id: usuario.id_usuario, email: usuario.email, role: usuario.role }, 'muayfit2026', { expiresIn: '8h' })

      return res.status(201).json({
        id: usuario.id_usuario,
        nome: usuario.nome,
        email: usuario.email,
        role: usuario.role,
        academia: usuario.academia,
        imagemPerfil: usuario.imagem_perfil ?? '',
        token
      })
    } catch (error) {
      console.error('Erro ao cadastrar usuário:', error)
      return res.status(500).json({ error: 'Erro interno ao cadastrar usuário' })
    }
  },

  async updateProfile(req: Request, res: Response) {
    const id = Number(req.headers.userId)
    if (!id) return res.status(401).json({ error: 'Usuário não autenticado' })
    try {
      const nome = String(req.body?.nome ?? '').trim() || undefined
      const email = String(req.body?.email ?? '').trim().toLowerCase() || undefined
      const academia = String(req.body?.academia ?? '').trim() || undefined
      const senha = String(req.body?.senha ?? '').trim()
      let imagem: string | undefined
      if (req.file) {
        imagem = `${id}${path.extname(req.file.originalname)}`
        fs.renameSync(req.file.path, path.resolve(req.file.destination, imagem))
      }
      const atualizado = await Usuario.atualizarPerfil(id, { nome, email, academia, senha, imagemPerfil: imagem })
      if (!atualizado) return res.status(404).json({ error: 'Usuário não encontrado' })
      return res.json({ ...atualizado, id: atualizado.id_usuario, imagemPerfil: atualizado.imagem_perfil ?? '' })
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error)
      return res.status(500).json({ error: 'Erro interno ao atualizar perfil' })
    }
  }
}

export default AuthController
