// Stub — impede o carregamento do binário nativo @libsql/win32-x64-msvc no Windows/dev.
// Em produção (Vercel/Linux) o binário nativo é substituído automaticamente.
// Este stub nunca é chamado na prática pois usamos transporte HTTP para o Turso (URLs https://).
class Database {
  constructor() {
    throw new Error("libsql local SQLite não está disponível neste ambiente. Use Turso via HTTP.");
  }
}
module.exports = Database;
module.exports.Authorization = null;
module.exports.SqliteError = class SqliteError extends Error {};
