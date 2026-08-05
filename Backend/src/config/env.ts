import dotenv from 'dotenv'
dotenv.config()

export const PORT = process.env.PORT ? Number(process.env.PORT) : 3000
export const DB_URL = process.env.DB_URL || ''
export const DB_HOST = process.env.DB_HOST || ''
export const DB_USER = process.env.DB_USER || ''
export const DB_NAME = process.env.DB_NAME || ''
export const DB_PASSWORD = process.env.DB_PASSWORD || process.env.SUPABASE_SECRET_KEY || ''
export const DB_PORT = process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432
export const USE_SUPABASE = process.env.USE_SUPABASE === 'true'
export const SUPABASE_URL = process.env.SUPABASE_URL || ''
export const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || ''
export const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY || ''
export const SUPABASE_JWKS_URL = process.env.SUPABASE_JWKS_URL || ''
export const JWT_SECRET = process.env.JWT_SECRET || 'changeme'
