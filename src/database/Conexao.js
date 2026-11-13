import * as SQLite from 'expo-sqlite';
import { Directory, Paths } from 'expo-file-system';

import { migracoes } from './migracoes';

const NOME_BANCO = 'feirafacil.db';
const PASTA_VOLUMES = 'volumes';

/**
 * Classe de conexão com o banco SQLite local do aparelho.
 *
 * O arquivo do banco fica em: <documentos do app>/volumes/feirafacil.db
 *
 * Uso (sempre a mesma instância — padrão Singleton):
 *   const db = await Conexao.getInstancia().abrir();
 *   const feiras = await db.getAllAsync('SELECT * FROM feiras');
 */
export default class Conexao {
  static #instancia = null;

  #db = null;
  #abrindo = null;

  static getInstancia() {
    if (!Conexao.#instancia) {
      Conexao.#instancia = new Conexao();
    }
    return Conexao.#instancia;
  }

  /** Pasta "volumes" dentro dos documentos do app (criada se não existir). */
  static getPastaVolumes() {
    const pasta = new Directory(Paths.document, PASTA_VOLUMES);
    if (!pasta.exists) {
      pasta.create({ intermediates: true, idempotent: true });
    }
    return pasta;
  }

  /** Abre a conexão (uma única vez) e aplica as migrações pendentes. */
  async abrir() {
    if (this.#db) return this.#db;

    // Evita abrir duas conexões se abrir() for chamado em paralelo
    if (!this.#abrindo) {
      this.#abrindo = (async () => {
        const pasta = Conexao.getPastaVolumes();
        const db = await SQLite.openDatabaseAsync(NOME_BANCO, undefined, pasta.uri);

        await db.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
        await this.#migrar(db);

        this.#db = db;
        return db;
      })().finally(() => {
        this.#abrindo = null;
      });
    }
    return this.#abrindo;
  }

  /** Retorna a conexão já aberta (lança erro se abrir() ainda não foi chamado). */
  getConexao() {
    if (!this.#db) {
      throw new Error('Banco não foi aberto. Chame await Conexao.getInstancia().abrir() primeiro.');
    }
    return this.#db;
  }

  async fechar() {
    if (this.#db) {
      await this.#db.closeAsync();
      this.#db = null;
    }
  }

  /**
   * Aplica as migrações em ordem, usando PRAGMA user_version
   * para saber qual versão do banco já está no aparelho.
   */
  async #migrar(db) {
    const { user_version: versaoAtual } = await db.getFirstAsync('PRAGMA user_version');

    for (const migracao of migracoes) {
      if (migracao.versao > versaoAtual) {
        await db.withExclusiveTransactionAsync(async (txn) => {
          await txn.execAsync(migracao.sql);
          await txn.execAsync(`PRAGMA user_version = ${migracao.versao}`);
        });
      }
    }
  }
}
