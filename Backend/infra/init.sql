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

-- Seeds mínimos
INSERT INTO usuario (nome, email, senha, role, academia)
VALUES ('Admin', 'admin@example.com', 'changeme', 'ADMIN', 'Minha Academia')
ON CONFLICT (email) DO NOTHING;
