/**
 * Migration idempotente: Setor direto em Modulo → Curso/CursoSetor/CursoModulo
 * Executar UMA vez após prisma db push.
 * Seguro rodar múltiplas vezes (upsert em tudo).
 *
 * npx tsx src/scripts/migrateModulosToCursos.ts
 */
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

async function migrar() {
    console.log('🔄 Iniciando migração de módulos para cursos...')

    const modulos = await db.modulos.findMany({
        select: { id: true, setor: true, nome: true }
    })

    console.log(`📦 ${modulos.length} módulos encontrados`)

    const setoresMap = new Map<string, string>()

    for (const mod of modulos) {
        const setores = (mod.setor || '')
            .split(',')
            .map(s => s.trim())
            .filter(Boolean)

        if (setores.length === 0) {
            console.log(`⚠️  Módulo "${mod.nome}" sem setor — pulando`)
            continue
        }

        for (const setor of setores) {
            const cursoNome = `Geral ${setor}`

            if (!setoresMap.has(setor)) {
                const curso = await db.curso.upsert({
                    where: { nome: cursoNome },
                    create: { nome: cursoNome, descricao: `Módulos gerais de ${setor}`, ordem: 0 },
                    update: {}
                })

                await db.cursoSetor.upsert({
                    where: { cursoId_setor: { cursoId: curso.id, setor } },
                    create: { cursoId: curso.id, setor },
                    update: {}
                })

                setoresMap.set(setor, curso.id)
                console.log(`✅ Curso "${cursoNome}" criado/confirmado (id: ${curso.id})`)
            }

            const cursoId = setoresMap.get(setor)!

            await db.cursoModulo.upsert({
                where: { cursoId_moduloId: { cursoId, moduloId: mod.id } },
                create: { cursoId, moduloId: mod.id },
                update: {}
            })

            console.log(`   → Módulo "${mod.nome}" vinculado ao curso "${cursoNome}"`)
        }
    }

    const totalCursos = await db.curso.count()
    const totalVinculos = await db.cursoModulo.count()
    console.log(`\n✅ Migração concluída: ${totalCursos} cursos, ${totalVinculos} vínculos módulo-curso`)
}

migrar()
    .catch(e => { console.error('❌ Erro:', e); process.exit(1) })
    .finally(() => db.$disconnect())
