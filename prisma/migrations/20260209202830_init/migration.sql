-- CreateTable
CREATE TABLE "usuarios" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "usuario" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'User',
    "permissoes" TEXT
);

-- CreateTable
CREATE TABLE "chamados" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ABERTO',
    "prioridade" TEXT NOT NULL DEFAULT 'MEDIA',
    "solucao" TEXT,
    "usuarioId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "chamados_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "consultas_radar" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "cnpj" TEXT NOT NULL,
    "razao_social" TEXT,
    "nome_fantasia" TEXT,
    "situacao_radar" TEXT,
    "submodalidade" TEXT,
    "data_situacao" DATETIME,
    "municipio" TEXT,
    "uf" TEXT,
    "regime_tributario" TEXT,
    "capital_social" TEXT,
    "data_constituicao" DATETIME,
    "contribuinte" TEXT,
    "data_consulta" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fonte" TEXT NOT NULL,
    "json_completo" TEXT NOT NULL,
    "arquivo_id" INTEGER,
    "DataSimples" DATETIME,
    CONSTRAINT "consultas_radar_arquivo_id_fkey" FOREIGN KEY ("arquivo_id") REFERENCES "arquivos_radar" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "arquivos_radar" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome_arquivo" TEXT NOT NULL,
    "data_upload" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "total_registros" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "reservas" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sala" TEXT NOT NULL,
    "usuario" TEXT NOT NULL,
    "data" DATETIME NOT NULL,
    "inicio" DATETIME NOT NULL,
    "fim" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'Agendado'
);

-- CreateTable
CREATE TABLE "documentos_diretorio" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "url" TEXT NOT NULL,
    "setor" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "data_criacao" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_usuario_key" ON "usuarios"("usuario");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE INDEX "chamados_usuarioId_idx" ON "chamados"("usuarioId");

-- CreateIndex
CREATE INDEX "chamados_status_idx" ON "chamados"("status");

-- CreateIndex
CREATE UNIQUE INDEX "consultas_radar_cnpj_key" ON "consultas_radar"("cnpj");

-- CreateIndex
CREATE INDEX "consultas_radar_cnpj_idx" ON "consultas_radar"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "arquivos_radar_nome_arquivo_key" ON "arquivos_radar"("nome_arquivo");
