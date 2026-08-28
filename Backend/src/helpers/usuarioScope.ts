import type { Request, Response } from 'express'

export const getUsuarioIdFromRequest = (req: Request): number | null => {
  const rawValue = req.headers['userId'] ?? req.headers['userid'] ?? req.headers['x-user-id']
  const value = Array.isArray(rawValue) ? rawValue[0] : rawValue

  if (!value) return null

  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

export const requireUsuarioId = (req: Request, res: Response): number | null => {
  const usuarioId = getUsuarioIdFromRequest(req)

  if (!usuarioId) {
    res.status(401).json({ error: 'Usuário não autenticado' })
    return null
  }

  return usuarioId
}
