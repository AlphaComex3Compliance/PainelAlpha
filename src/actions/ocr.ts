"use server";

import { TextractClient, AnalyzeDocumentCommand } from "@aws-sdk/client-textract";
import { randomUUID } from "crypto";

const client = new TextractClient({
    region: "us-east-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    },
});

type Transacao = {
    id: string;
    data: string;
    descricao: string;
    valor: number;
    nomeBanco?: string;
    documento?: string;
    _warningDataAusente?: boolean;
};

/**
 * Converte string monetária para número.
 * Regra: se tem vírgula → vírgula é decimal, ponto é milhar.
 * Se NÃO tem vírgula mas tem ponto → milhar se último segmento tem 3 dígitos ou há múltiplos pontos.
 *
 * Casos cobertos:
 *   "1.234"       → 1234.00  (ponto como milhar — 3 dígitos após)
 *   "1.234,56"    → 1234.56  (vírgula é decimal)
 *   "1234,56"     → 1234.56
 *   "1234"        → 1234.00
 *   "R$ -1.234,56"→ -1234.56
 *   "1.5"         → 1.5      (ponto decimal — apenas 1 dígito após)
 *   "1.23"        → 1.23     (ponto decimal — 2 dígitos após)
 */
const converterValor = (t: string): number => {
    if (!t) return 0;
    let limpo = t.replace(/[^\d.,-]/g, "").trim();
    if (!limpo) return 0;

    const temVirgula = limpo.includes(",");
    const temPonto = limpo.includes(".");

    if (temVirgula) {
        // Vírgula é decimal → ponto é separador de milhar
        limpo = limpo.replace(/\./g, "").replace(",", ".");
    } else if (temPonto) {
        const partes = limpo.split(".");
        // Múltiplos pontos OU último segmento com exatamente 3 dígitos → milhar
        if (partes.length > 2 || partes[partes.length - 1].length === 3) {
            limpo = limpo.replace(/\./g, "");
        }
        // Caso contrário: ponto é decimal ("1.5", "1.23")
    }

    return parseFloat(limpo) || 0;
};

export async function ProcessarExtratoIA(formData: FormData) {
    try {
        const file = formData.get("file") as File;
        const layoutRaw = String(formData.get("layoutAlvo") || "");
        // layoutAlvo é sempre lowercase — todos os includes devem usar lowercase
        const layoutAlvo = layoutRaw.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

        let dataCorrente = String(formData.get("ultimaData") || "");

        if (!file) return { success: false, error: "Arquivo vazio" };

        // Fix #8: rejeitar antes de chamar Textract
        if (file.size > 10 * 1024 * 1024) {
            return { success: false, error: "Arquivo excede o limite de 10MB. Reduza o tamanho do PDF e tente novamente." };
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        const response = await client.send(new AnalyzeDocumentCommand({
            Document: { Bytes: buffer },
            FeatureTypes: ["TABLES"],
        }));

        const blocks = response.Blocks || [];
        const tables = blocks.filter(b => b.BlockType === "TABLE");
        const extratoFinal: Transacao[] = [];
        let warningDataAusente = 0;

        // Fix #1: todos lowercase — layoutAlvo já é lowercase, checks devem ser lowercase
        const eItauC    = layoutAlvo.includes("itauc");
        const eItau     = layoutAlvo.includes("itau");      // "itauc" também inclui "itau" — eItauC é checado primeiro no else-if
        const eBB       = layoutAlvo.includes("brasil") || layoutAlvo.includes("bb");
        const eBradesco = layoutAlvo.includes("bradesco");
        const eSantander = layoutAlvo.includes("santander");
        const credCrea  = layoutAlvo.includes("credcrea");
        const eCaixa    = layoutAlvo.includes("caixa");
        const eSicoob   = layoutAlvo.includes("sicoob");
        const eInter    = layoutAlvo.includes("inter");
        const eNubank   = layoutAlvo.includes("nubank");

        // A FAZER ----
        const ePagBank  = layoutAlvo.includes("pagbank");
        const eC6       = layoutAlvo.includes("c6");
        const eSicredi  = layoutAlvo.includes("sicredi");
        const eMP       = layoutAlvo.includes("mercadopago");  // Fix #1: era "mercadoPago"
        const eBancoPan = layoutAlvo.includes("bancopan");     // Fix #1: era "bancoPan"
        // --- FIM BANCOS ATUAIS ----

        // Silencia "unused variable" dos bancos A FAZER sem remover as declarações
        void ePagBank; void eC6; void eSicredi; void eMP; void eBancoPan;

        // Fix #3: helper que empurra a transação e marca warning se data estiver vazia
        const empurrar = (tx: Omit<Transacao, "_warningDataAusente">) => {
            if (!tx.data) {
                warningDataAusente++;
                extratoFinal.push({ ...tx, _warningDataAusente: true });
            } else {
                extratoFinal.push(tx);
            }
        };

        tables.forEach((table, tIdx) => {
            const rows: Record<number, Record<number, string>> = {};

            // Fix #5: usar find com Type === "CHILD" em vez de [0] (primeiro pode não ser CHILD)
            const cellIds = table.Relationships?.find(r => r.Type === "CHILD")?.Ids || [];

            cellIds.forEach(id => {
                const cell = blocks.find(b => b.Id === id);
                if (cell && cell.RowIndex !== undefined && cell.ColumnIndex !== undefined) {
                    // Fix #5: buscar relação CHILD do cell e filtrar apenas WORD blocks
                    const wordIds = cell.Relationships?.find(r => r.Type === "CHILD")?.Ids || [];
                    const txt = blocks
                        .filter(b => wordIds.includes(b.Id || "") && b.BlockType === "WORD")
                        .map(b => b.Text)
                        .join(" ")
                        .trim();
                    if (!rows[cell.RowIndex]) rows[cell.RowIndex] = {};
                    rows[cell.RowIndex][cell.ColumnIndex] = txt;
                }
            });

            Object.keys(rows).map(Number).sort((a, b) => a - b).forEach(idx => {
                const r = rows[idx];

                if (r[1] && r[1].includes("/")) {
                    const match = r[1].match(/(\d{2}\/\d{2}(\/\d{4})?)/);
                    if (match) dataCorrente = match[0];
                }

                if (eItauC) {
                    const vE = converterValor(r[3]);
                    const vS = converterValor(r[4]);
                    if (vE !== 0 || vS !== 0) {
                        empurrar({
                            id: `itc-${tIdx}-${idx}-${randomUUID()}`, // Fix #10
                            data: dataCorrente,
                            descricao: r[2] || "LANÇAMENTO ITAU",
                            valor: vS !== 0 ? -Math.abs(vS) : vE,
                        });
                    }
                }

                else if (eItau) {
                    const valorRaw = r[5];
                    const valorNumerico = converterValor(valorRaw);

                    const descOriginal = r[1] || "";
                    const detalheOriginal = r[2] || "";

                    const regexData = /\d{2}\/\d{2}(\/\d{2,4})?/g;

                    const descLimpa = descOriginal.replace(regexData, "").trim();
                    const detalheLimpo = detalheOriginal.replace(regexData, "").trim();

                    const descFinal = `${descLimpa} ${detalheLimpo ? `- ${detalheLimpo}` : ""}`
                        .toUpperCase()
                        .replace(/\s+/g, " ")
                        .trim();

                    const isSaldo = descFinal.includes("SALDO") || descFinal.includes("S D O");

                    if (valorNumerico !== 0 && !isSaldo) {
                        empurrar({
                            id: `ite-${tIdx}-${idx}-${randomUUID()}`, // Fix #10
                            data: r[0] || dataCorrente,
                            descricao: descFinal,
                            documento: r[3] || "",
                            valor: valorNumerico,
                            nomeBanco: "ITAÚ",
                        });
                    }
                }

                else if (eBB) {
                    const valorBruto = r[5] || "";
                    const descricao = r[4] || "";

                    const ehSaldo = descricao.toLowerCase().includes("saldo");

                    if (valorBruto && !ehSaldo) {
                        let valorNumerico = converterValor(valorBruto.replace(/[()+]/g, "").replace("-", "").trim());

                        if (valorBruto.includes("-")) {
                            valorNumerico = -Math.abs(valorNumerico);
                        }

                        if (valorNumerico !== 0) {
                            empurrar({
                                id: `bb-${tIdx}-${idx}-${randomUUID()}`, // Fix #10
                                data: dataCorrente,
                                descricao: descricao.toUpperCase().trim(),
                                valor: valorNumerico,
                            });
                        }
                    }
                }

                // Fix #7: Bradesco, Santander e CredCrea em blocos distintos
                // (cada um pode ter estrutura de colunas diferente — personalizar conforme layout real)
                else if (eBradesco) {
                    const vE = converterValor(r[4]);
                    const vS = converterValor(r[5]);
                    if (vE !== 0 || vS !== 0) {
                        empurrar({
                            id: `brad-${tIdx}-${idx}-${randomUUID()}`, // Fix #10
                            data: dataCorrente,
                            descricao: r[2] || "LANÇAMENTO BRADESCO",
                            valor: vS !== 0 ? -Math.abs(vS) : vE,
                        });
                    }
                }

                else if (eSantander) {
                    const vE = converterValor(r[4]);
                    const vS = converterValor(r[5]);
                    if (vE !== 0 || vS !== 0) {
                        empurrar({
                            id: `san-${tIdx}-${idx}-${randomUUID()}`, // Fix #10
                            data: dataCorrente,
                            descricao: r[2] || "LANÇAMENTO SANTANDER",
                            valor: vS !== 0 ? -Math.abs(vS) : vE,
                        });
                    }
                }

                else if (credCrea) {
                    const vE = converterValor(r[4]);
                    const vS = converterValor(r[5]);
                    if (vE !== 0 || vS !== 0) {
                        empurrar({
                            id: `cc-${tIdx}-${idx}-${randomUUID()}`, // Fix #10
                            data: dataCorrente,
                            descricao: r[2] || "LANÇAMENTO CREDCREA",
                            valor: vS !== 0 ? -Math.abs(vS) : vE,
                        });
                    }
                }

                else if (eCaixa) {
                    const valorBruto = r[6] || "";
                    const descricao = r[3] || "";
                    const descReal = descricao || "LANÇAMENTO CAIXA";

                    if (valorBruto && !descReal.includes("SALDO")) {
                        let valorNumerico = converterValor(valorBruto.replace(/[CD]/g, "").trim());
                        if (valorBruto.toUpperCase().includes("D")) valorNumerico = -Math.abs(valorNumerico);

                        if (valorNumerico !== 0) {
                            empurrar({
                                id: `cx-${tIdx}-${idx}-${randomUUID()}`, // Fix #10
                                data: dataCorrente,
                                descricao: descReal.toUpperCase(),
                                valor: valorNumerico,
                            });
                        }
                    }
                }

                else if (eSicoob) {
                    const valorBruto = r[5] || "";
                    const descricao = r[3] || "";

                    if (valorBruto && !descricao.toUpperCase().includes("SALDO")) {
                        const ehDebito = valorBruto.toUpperCase().includes("D");
                        const valorLimpo = valorBruto.replace(/R\$/g, "").replace(/[a-zA-Z]/g, "").trim();
                        let valorNumerico = converterValor(valorLimpo);

                        valorNumerico = ehDebito ? -Math.abs(valorNumerico) : Math.abs(valorNumerico);

                        if (valorNumerico !== 0) {
                            empurrar({
                                id: `sb-${tIdx}-${idx}-${randomUUID()}`, // Fix #10
                                data: dataCorrente,
                                descricao: descricao.toUpperCase().trim() || "LANÇAMENTO SICOOB",
                                valor: valorNumerico,
                            });
                        }
                    }
                }

                else if (eInter) {
                    const linhaCompleta = Object.values(r).join(" ").trim();

                    if (linhaCompleta.includes(" de ") && linhaCompleta.match(/\d{4}/)) {
                        dataCorrente = linhaCompleta;
                        return;
                    }

                    // Fix #6: remover dead code (split(":") em "LANÇAMENTO INTER" não tem efeito)
                    // textoBruto é calculado diretamente e usado como descricao
                    let textoBruto = "";
                    if (r[0] && !r[0].includes("R$") && !r[0].includes(" de ")) {
                        textoBruto = r[0];
                    } else if (r[1] && !r[1].includes("R$")) {
                        textoBruto = r[1];
                    }

                    const valorBruto = r[2] || r[1] || "";

                    // Fix #6: checar SALDO em textoBruto, não em descricaoReal (que estava hardcoded)
                    if (valorBruto.includes("R$") && !textoBruto.toUpperCase().includes("SALDO")) {
                        const descricaoReal = textoBruto.trim().toUpperCase() || "LANÇAMENTO INTER";
                        const ehSaida = valorBruto.includes("-");
                        const match = valorBruto.match(/([\d.]+,\d{2})/);

                        if (match) {
                            let v = converterValor(match[0]);
                            if (ehSaida) v = -Math.abs(v);

                            if (v !== 0) {
                                empurrar({
                                    id: `inter-${tIdx}-${idx}-${randomUUID()}`, // Fix #10
                                    data: dataCorrente,
                                    descricao: descricaoReal,
                                    valor: v,
                                });
                            }
                        }
                    }
                }

                else if (eNubank) {
                    const linhaCompleta = Object.values(r).join(" ").trim();
                    const matchData = linhaCompleta.match(/(\d{2}\s+[A-Z]{3}\s+\d{4})/i);

                    if (matchData) {
                        dataCorrente = matchData[0];
                        if (linhaCompleta.length < 15) return;
                    }

                    const textoValor = r[5] || r[4] || r[3] || "";

                    const titulo = (r[2] || "").trim();
                    const detalhe = (r[3] || "").trim();
                    let textoDesc = titulo;
                    if (detalhe && detalhe !== titulo && !detalhe.includes("/") && !detalhe.includes("R$")) {
                        textoDesc += " - " + detalhe;
                    }

                    const descricaoFinal = textoDesc.toUpperCase();
                    const ehResumo = descricaoFinal.includes("SALDO") || descricaoFinal.includes("TOTAL DE");

                    if (textoValor && !ehResumo) {
                        const palavrasEntrada = ["RECEBIDO", "RECEBIDA", "REEMBOLSO", "ESTORNO", "DEPÓSITO", "RENDIMENTO", "TRANSFERÊNCIA RECEBIDA"];
                        const ehEntrada = palavrasEntrada.some(p => descricaoFinal.includes(p));

                        const apenasNumeros = textoValor.replace(/[^\d.,]/g, "");
                        let v = converterValor(apenasNumeros);

                        if (v !== 0) {
                            v = ehEntrada ? Math.abs(v) : -Math.abs(v);

                            empurrar({
                                id: `nu-${tIdx}-${idx}-${randomUUID()}`, // Fix #10
                                data: dataCorrente,
                                descricao: descricaoFinal.trim(),
                                valor: v,
                            });
                        }
                    }
                }
            });
        });

        // Fix #9: aviso se nenhuma transação extraída (sucesso técnico, problema de layout)
        if (extratoFinal.length === 0) {
            return {
                success: true,
                data: [],
                ultimaDataEncontrada: dataCorrente,
                warning: "Nenhuma transação extraída — verifique se o layout do banco está correto",
            };
        }

        return {
            success: true,
            data: extratoFinal,
            ultimaDataEncontrada: dataCorrente,
            ...(warningDataAusente > 0 && { warningDataAusente }),
        };
    } catch (e) {
        // Fix #4: catch detalhado com log no servidor
        const err = e as Error;
        console.error("[ProcessarExtratoIA]", err);
        return {
            success: false,
            error: err.message || "Erro desconhecido",
            ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
        };
    }
}
