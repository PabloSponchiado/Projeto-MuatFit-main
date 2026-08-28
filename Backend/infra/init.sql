-- Schema inicial para acervo digital (adaptado ao frontend)

CREATE TABLE IF NOT EXISTS usuario (
  id_usuario SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  senha TEXT NOT NULL,
  role TEXT NOT NULL,
  academia TEXT
);

CREATE TABLE IF NOT EXISTS adultos (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuario(id_usuario) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  cpf TEXT NOT NULL UNIQUE,
  data_nascimento DATE,
  email TEXT,
  telefone TEXT,
  endereco TEXT,
  data_matricula DATE DEFAULT CURRENT_DATE,
  ativo BOOLEAN DEFAULT true,
  graduacao_atual TEXT,
  observacoes TEXT
);

CREATE TABLE IF NOT EXISTS kids (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuario(id_usuario) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  cpf TEXT NOT NULL UNIQUE,
  data_nascimento DATE,
  email TEXT,
  telefone TEXT,
  endereco TEXT,
  data_matricula DATE DEFAULT CURRENT_DATE,
  ativo BOOLEAN DEFAULT true,
  graduacao_atual TEXT,
  responsavel TEXT,
  telefone_responsavel TEXT,
  observacoes TEXT
);

CREATE TABLE IF NOT EXISTS graduacoes (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuario(id_usuario) ON DELETE CASCADE,
  aluno_id INTEGER NOT NULL,
  aluno_nome TEXT,
  nivel_anterior TEXT,
  nivel_atual TEXT NOT NULL,
  data_graduacao DATE NOT NULL,
  observacao TEXT,
  examinador TEXT
);

CREATE TABLE IF NOT EXISTS pagamentos (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuario(id_usuario) ON DELETE CASCADE,
  aluno_id INTEGER NOT NULL,
  aluno_nome TEXT,
  valor NUMERIC(10,2) NOT NULL,
  data_vencimento DATE NOT NULL,
  data_pagamento DATE,
  status TEXT NOT NULL,
  mes TEXT,
  ano INTEGER,
  observacao TEXT
);

ALTER TABLE IF EXISTS adultos ADD COLUMN IF NOT EXISTS usuario_id INTEGER;
ALTER TABLE IF EXISTS kids ADD COLUMN IF NOT EXISTS usuario_id INTEGER;
ALTER TABLE IF EXISTS graduacoes ADD COLUMN IF NOT EXISTS usuario_id INTEGER;
ALTER TABLE IF EXISTS pagamentos ADD COLUMN IF NOT EXISTS usuario_id INTEGER;

UPDATE adultos SET usuario_id = (SELECT id_usuario FROM usuario ORDER BY id_usuario LIMIT 1) WHERE usuario_id IS NULL;
UPDATE kids SET usuario_id = (SELECT id_usuario FROM usuario ORDER BY id_usuario LIMIT 1) WHERE usuario_id IS NULL;
UPDATE graduacoes SET usuario_id = (SELECT id_usuario FROM usuario ORDER BY id_usuario LIMIT 1) WHERE usuario_id IS NULL;
UPDATE pagamentos SET usuario_id = (SELECT id_usuario FROM usuario ORDER BY id_usuario LIMIT 1) WHERE usuario_id IS NULL;

ALTER TABLE adultos ALTER COLUMN usuario_id SET NOT NULL;
ALTER TABLE kids ALTER COLUMN usuario_id SET NOT NULL;
ALTER TABLE graduacoes ALTER COLUMN usuario_id SET NOT NULL;
ALTER TABLE pagamentos ALTER COLUMN usuario_id SET NOT NULL;

ALTER TABLE adultos
  ADD CONSTRAINT IF NOT EXISTS adultos_usuario_fk
  FOREIGN KEY (usuario_id) REFERENCES usuario(id_usuario) ON DELETE CASCADE;

ALTER TABLE kids
  ADD CONSTRAINT IF NOT EXISTS kids_usuario_fk
  FOREIGN KEY (usuario_id) REFERENCES usuario(id_usuario) ON DELETE CASCADE;

ALTER TABLE graduacoes
  ADD CONSTRAINT IF NOT EXISTS graduacoes_usuario_fk
  FOREIGN KEY (usuario_id) REFERENCES usuario(id_usuario) ON DELETE CASCADE;

ALTER TABLE pagamentos
  ADD CONSTRAINT IF NOT EXISTS pagamentos_usuario_fk
  FOREIGN KEY (usuario_id) REFERENCES usuario(id_usuario) ON DELETE CASCADE;

-- Seeds mínimos
INSERT INTO usuario (nome, email, senha, role, academia)
VALUES 
  ('Admin', 'admin@example.com', 'changeme', 'ADMIN', 'Minha Academia'),
  ('Admin', 'admin@muayfit.com', '123456', 'ADMIN', 'Minha Academia')
ON CONFLICT (email) DO NOTHING;
