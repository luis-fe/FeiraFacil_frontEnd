/**
 * Migrações do banco de dados.
 *
 * Regras:
 *  - Nunca altere uma migração que já foi publicada; crie uma nova com versão maior.
 *  - As versões devem ser números inteiros crescentes (1, 2, 3...).
 */
export const migracoes = [
  {
    versao: 1,
    sql: `
      CREATE TABLE IF NOT EXISTS usuarios (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        nome        TEXT    NOT NULL,
        email       TEXT    UNIQUE,
        criado_em   TEXT    NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS feiras (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        nome        TEXT    NOT NULL,
        endereco    TEXT,
        dia_semana  TEXT,
        horario     TEXT,
        criado_em   TEXT    NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS produtos (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        feira_id    INTEGER REFERENCES feiras(id) ON DELETE CASCADE,
        nome        TEXT    NOT NULL,
        preco       REAL    NOT NULL DEFAULT 0,
        unidade     TEXT    DEFAULT 'un',
        criado_em   TEXT    NOT NULL DEFAULT (datetime('now'))
      );

      CREATE INDEX IF NOT EXISTS idx_produtos_feira ON produtos(feira_id);
    `,
  },
];
