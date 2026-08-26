import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

/**
 * Classe que representa o modelo de banco de dados.
 */
export class DatabaseModel {
  /**
   * Configuração para conexão com o banco de dados
   */
  private _config: object;

  private async runMigration() {
    const migrationSql = `
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
          SELECT 1 FROM pg_constraint
          WHERE conname = 'adultos_usuario_fk'
        ) THEN
          ALTER TABLE adultos
            ADD CONSTRAINT adultos_usuario_fk
            FOREIGN KEY (usuario_id) REFERENCES usuario(id_usuario) ON DELETE CASCADE;
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint
          WHERE conname = 'kids_usuario_fk'
        ) THEN
          ALTER TABLE kids
            ADD CONSTRAINT kids_usuario_fk
            FOREIGN KEY (usuario_id) REFERENCES usuario(id_usuario) ON DELETE CASCADE;
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint
          WHERE conname = 'graduacoes_usuario_fk'
        ) THEN
          ALTER TABLE graduacoes
            ADD CONSTRAINT graduacoes_usuario_fk
            FOREIGN KEY (usuario_id) REFERENCES usuario(id_usuario) ON DELETE CASCADE;
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint
          WHERE conname = 'pagamentos_usuario_fk'
        ) THEN
          ALTER TABLE pagamentos
            ADD CONSTRAINT pagamentos_usuario_fk
            FOREIGN KEY (usuario_id) REFERENCES usuario(id_usuario) ON DELETE CASCADE;
        END IF;
      END $$;
    `;

    await this._pool.query(migrationSql);
  }

  /**
   * Pool de conexões com o banco de dados
   */
  private _pool: pg.Pool;

  /**
   * Cliente de conexão com o banco de dados
   */
  private _client: pg.Client;

  /**
   * Construtor da classe DatabaseModel.
   */
  constructor() {
    // Configuração padrão para conexão com o banco de dados
    this._config = {
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT,
      max: 10,
      idleTimoutMillis: 10000,
    };

    // Inicialização do pool de conexões
    this._pool = new pg.Pool(this._config);

    // Inicialização do cliente de conexão
    this._client = new pg.Client(this._config);
  }

  /**
   * Método para testar a conexão com o banco de dados.
   *
   * @returns **true** caso a conexão tenha sido feita, **false** caso negativo
   */
  public async testeConexao() {
    try {
      // Tenta conectar ao banco de dados
      await this._client.connect();
      console.log("Database connected!");
      await this.runMigration();
      // Encerra a conexão
      this._client.end();
      return true;
    } catch (error) {
      // Em caso de erro, exibe uma mensagem de erro
      console.log("Error to connect database X( ");
      console.log(error);
      // Encerra a conexão
      this._client.end();
      return false;
    }
  }

  public async ensureSchema() {
    await this.runMigration();
  }

  public get pool() {
    return this._pool;
  }
}