-- Migration RH/Colaboradores — aplicar no Turso
-- Gerado em 2026-05-21

-- Novas colunas em usuarios
ALTER TABLE "usuarios" ADD COLUMN "cpf" TEXT;
ALTER TABLE "usuarios" ADD COLUMN "data_nascimento" TEXT;
ALTER TABLE "usuarios" ADD COLUMN "telefone" TEXT;
ALTER TABLE "usuarios" ADD COLUMN "telefone_corporativo" TEXT;
ALTER TABLE "usuarios" ADD COLUMN "contato_emerg_1_nome" TEXT;
ALTER TABLE "usuarios" ADD COLUMN "contato_emerg_1_tel" TEXT;
ALTER TABLE "usuarios" ADD COLUMN "contato_emerg_2_nome" TEXT;
ALTER TABLE "usuarios" ADD COLUMN "contato_emerg_2_tel" TEXT;
ALTER TABLE "usuarios" ADD COLUMN "observacoes_internas" TEXT;

-- Nova tabela: cargo_colaborador
CREATE TABLE IF NOT EXISTS "cargo_colaborador" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS "cargo_colaborador_nome_key" ON "cargo_colaborador"("nome");

-- Nova tabela: modalidade_contrato
CREATE TABLE IF NOT EXISTS "modalidade_contrato" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS "modalidade_contrato_nome_key" ON "modalidade_contrato"("nome");

-- Nova tabela: contrato_colaborador
CREATE TABLE IF NOT EXISTS "contrato_colaborador" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "usuarioId" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "modalidade" TEXT NOT NULL,
    "dataInicio" DATETIME NOT NULL,
    "dataFim" DATETIME,
    "renovacaoNumero" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'EXPERIENCIA',
    "contratoUrl" TEXT,
    "observacoes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "contrato_colaborador_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "contrato_colaborador_usuarioId_idx" ON "contrato_colaborador"("usuarioId");
CREATE INDEX IF NOT EXISTS "contrato_colaborador_status_idx" ON "contrato_colaborador"("status");

-- Nova tabela: checklist_documental
CREATE TABLE IF NOT EXISTS "checklist_documental" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "usuarioId" INTEGER NOT NULL,
    "carteiraTrabalho" BOOLEAN NOT NULL DEFAULT false,
    "pis" BOOLEAN NOT NULL DEFAULT false,
    "identidade" BOOLEAN NOT NULL DEFAULT false,
    "cpfDoc" BOOLEAN NOT NULL DEFAULT false,
    "cnh" BOOLEAN NOT NULL DEFAULT false,
    "tituloEleitor" BOOLEAN NOT NULL DEFAULT false,
    "reservista" BOOLEAN NOT NULL DEFAULT false,
    "comprovanteResidencia" BOOLEAN NOT NULL DEFAULT false,
    "certidao" BOOLEAN NOT NULL DEFAULT false,
    "foto3x4" BOOLEAN NOT NULL DEFAULT false,
    "exameAdmissional" BOOLEAN NOT NULL DEFAULT false,
    "escolaridade" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "checklist_documental_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "checklist_documental_usuarioId_key" ON "checklist_documental"("usuarioId");
