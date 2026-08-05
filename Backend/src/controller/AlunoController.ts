import type { Request, Response } from 'express'

const AlunoController = {
  async index(req: Request, res: Response) {
    return res.json({ data: [] })
  },
  async show(req: Request, res: Response) {
    const { id } = req.params
    return res.json({ id })
  },
  async create(req: Request, res: Response) {
    const payload = req.body
    return res.status(201).json({ data: payload })
  }
}

export default AlunoController
