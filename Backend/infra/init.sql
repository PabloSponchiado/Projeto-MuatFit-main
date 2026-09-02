-- Schema inicial para acervo digital (adaptado ao frontend)

-- Recria o schema do zero. ATENCAO: todos os dados existentes serao apagados.
DROP TABLE IF EXISTS pagamentos CASCADE;
DROP TABLE IF EXISTS graduacoes CASCADE;
DROP TABLE IF EXISTS kids CASCADE;
DROP TABLE IF EXISTS adultos CASCADE;
DROP TABLE IF EXISTS usuario CASCADE;

CREATE TABLE IF NOT EXISTS usuario (
  id_usuario SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  senha TEXT NOT NULL,
  role TEXT NOT NULL,
  academia TEXT,
  imagem_perfil TEXT
);

CREATE TABLE IF NOT EXISTS adultos (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL,
  nome TEXT NOT NULL,
  cpf TEXT NOT NULL UNIQUE,
  data_nascimento DATE,
  email TEXT,
  telefone TEXT,
  endereco TEXT,
  data_matricula DATE DEFAULT CURRENT_DATE,
  ativo BOOLEAN DEFAULT true,
  graduacao_atual TEXT,
  observacoes TEXT,
  imagem_perfil TEXT
);

CREATE TABLE IF NOT EXISTS kids (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL,
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
  observacoes TEXT,
  imagem_perfil TEXT
);

CREATE TABLE IF NOT EXISTS graduacoes (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL,
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
  usuario_id INTEGER NOT NULL,
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

UPDATE adultos SET usuario_id = (SELECT id_usuario FROM usuario ORDER BY id_usuario LIMIT 1) WHERE usuario_id IS NULL;
UPDATE kids SET usuario_id = (SELECT id_usuario FROM usuario ORDER BY id_usuario LIMIT 1) WHERE usuario_id IS NULL;
UPDATE graduacoes SET usuario_id = (SELECT id_usuario FROM usuario ORDER BY id_usuario LIMIT 1) WHERE usuario_id IS NULL;
UPDATE pagamentos SET usuario_id = (SELECT id_usuario FROM usuario ORDER BY id_usuario LIMIT 1) WHERE usuario_id IS NULL;

ALTER TABLE adultos ALTER COLUMN usuario_id SET NOT NULL;
ALTER TABLE kids ALTER COLUMN usuario_id SET NOT NULL;
ALTER TABLE graduacoes ALTER COLUMN usuario_id SET NOT NULL;
ALTER TABLE pagamentos ALTER COLUMN usuario_id SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'adultos_usuario_fk') THEN
    ALTER TABLE adultos
      ADD CONSTRAINT adultos_usuario_fk
      FOREIGN KEY (usuario_id) REFERENCES usuario(id_usuario) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'kids_usuario_fk') THEN
    ALTER TABLE kids
      ADD CONSTRAINT kids_usuario_fk
      FOREIGN KEY (usuario_id) REFERENCES usuario(id_usuario) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'graduacoes_usuario_fk') THEN
    ALTER TABLE graduacoes
      ADD CONSTRAINT graduacoes_usuario_fk
      FOREIGN KEY (usuario_id) REFERENCES usuario(id_usuario) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pagamentos_usuario_fk') THEN
    ALTER TABLE pagamentos
      ADD CONSTRAINT pagamentos_usuario_fk
      FOREIGN KEY (usuario_id) REFERENCES usuario(id_usuario) ON DELETE CASCADE;
  END IF;
END $$;

-- Seeds mínimos
INSERT INTO usuario (nome, email, senha, role, academia)
VALUES 
  ('Admin', 'admin@example.com', 'changeme', 'ADMIN', 'Minha Academia'),
  ('Admin', 'admin@muayfit.com', '123456', 'ADMIN', 'Minha Academia')
ON CONFLICT (email) DO NOTHING;
