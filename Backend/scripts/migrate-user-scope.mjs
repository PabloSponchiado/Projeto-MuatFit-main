import pg from 'pg';

const { Pool } = pg;
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'muayfit',
  password: 'admin',
  port: 5432,
});

const sql = `
  DO $$
  BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'adultos' AND column_name = 'usuario_id'
    ) THEN
      ALTER TABLE adultos ADD COLUMN usuario_id INTEGER;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'kids' AND column_name = 'usuario_id'
    ) THEN
      ALTER TABLE kids ADD COLUMN usuario_id INTEGER;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'graduacoes' AND column_name = 'usuario_id'
    ) THEN
      ALTER TABLE graduacoes ADD COLUMN usuario_id INTEGER;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'pagamentos' AND column_name = 'usuario_id'
    ) THEN
      ALTER TABLE pagamentos ADD COLUMN usuario_id INTEGER;
    END IF;
  END $$;

  DO $$
  DECLARE total_usuarios INTEGER;
  BEGIN
    SELECT COUNT(*)::int INTO total_usuarios FROM usuario;

    IF total_usuarios = 1 THEN
      UPDATE adultos
      SET usuario_id = (SELECT id_usuario FROM usuario ORDER BY id_usuario LIMIT 1)
      WHERE usuario_id IS NULL;

      UPDATE kids
      SET usuario_id = (SELECT id_usuario FROM usuario ORDER BY id_usuario LIMIT 1)
      WHERE usuario_id IS NULL;

      UPDATE graduacoes
      SET usuario_id = (SELECT id_usuario FROM usuario ORDER BY id_usuario LIMIT 1)
      WHERE usuario_id IS NULL;

      UPDATE pagamentos
      SET usuario_id = (SELECT id_usuario FROM usuario ORDER BY id_usuario LIMIT 1)
      WHERE usuario_id IS NULL;
    END IF;
  END $$;

  DO $$
  BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint WHERE conname = 'adultos_usuario_fk'
    ) THEN
      ALTER TABLE adultos
        ADD CONSTRAINT adultos_usuario_fk
        FOREIGN KEY (usuario_id) REFERENCES usuario(id_usuario) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint WHERE conname = 'kids_usuario_fk'
    ) THEN
      ALTER TABLE kids
        ADD CONSTRAINT kids_usuario_fk
        FOREIGN KEY (usuario_id) REFERENCES usuario(id_usuario) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint WHERE conname = 'graduacoes_usuario_fk'
    ) THEN
      ALTER TABLE graduacoes
        ADD CONSTRAINT graduacoes_usuario_fk
        FOREIGN KEY (usuario_id) REFERENCES usuario(id_usuario) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint WHERE conname = 'pagamentos_usuario_fk'
    ) THEN
      ALTER TABLE pagamentos
        ADD CONSTRAINT pagamentos_usuario_fk
        FOREIGN KEY (usuario_id) REFERENCES usuario(id_usuario) ON DELETE CASCADE;
    END IF;
  END $$;
`;

try {
  await pool.query(sql);
  const result = await pool.query(`
    SELECT table_name, column_name, data_type
    FROM information_schema.columns
    WHERE table_name IN ('usuario', 'adultos', 'kids', 'graduacoes', 'pagamentos')
    ORDER BY table_name, ordinal_position;
  `);
  console.log(JSON.stringify(result.rows, null, 2));
  console.log('MIGRACAO_OK');
} catch (error) {
  console.error('ERRO NA MIGRACAO:', error);
  process.exitCode = 1;
} finally {
  await pool.end();
}
