"use server";

import { TextractClient, AnalyzeDocumentCommand } from "@aws-sdk/client-textract";
import { Layout } from "lucide-react";

const client = new TextractClient({
    region: "us-east-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    },
});

const converterValor = (t: string) => {
    if (!t) return 0;
    let limpo = t.replace(/[^\d.,-]/g, "");
    if (limpo.includes(",") && limpo.includes(".")) {
        limpo = limpo.replace(/\./g, "").replace(",", ".");
    } else {
        limpo = limpo.replace(",", ".");
    }
    return parseFloat(limpo) || 0;
};

export async function ProcessarExtratoIA(formData: FormData) {
    try {
        const file = formData.get("file") as File;
        const layoutRaw = String(formData.get("layoutAlvo") || "");
        const layoutAlvo = layoutRaw.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

        let dataCorrente = String(formData.get("ultimaData") || "");

        if (!file) return { success: false, error: "Arquivo vazio" };
        const buffer = Buffer.from(await file.arrayBuffer());

        const response = await client.send(new AnalyzeDocumentCommand({
            Document: { Bytes: buffer },
            FeatureTypes: ["TABLES"],
        }));

        const blocks = response.Blocks || [];
        const tables = blocks.filter(b => b.BlockType === "TABLE");
        const extratoFinal: any[] = [];

        //----BANCOS ATUAIS----
        const eItauC = layoutAlvo.includes("itauC");
        const eItau = layoutAlvo.includes("itau");
        const eBB = layoutAlvo.includes("brasil") || layoutAlvo.includes("bb");
        const eBradesco = layoutAlvo.includes("bradesco");
        const eSantander = layoutAlvo.includes("santander");
        const credCrea = layoutAlvo.includes("credcrea");
        const eCaixa = layoutAlvo.includes("caixa");
        const eSicoob = layoutAlvo.includes("sicoob");
        const eInter = layoutAlvo.includes("inter");
        const eNubank = layoutAlvo.includes("nubank");


        // A FAZER ----
        const ePagBank = layoutAlvo.includes("pagbank");
        const eC6 = layoutAlvo.includes("c6");
        const eSicredi = layoutAlvo.includes("sicredi");
        const eMP = layoutAlvo.includes("mercadoPago");
        const eBancoPan = layoutAlvo.includes("bancoPan");

        // --- FIM BANCOS ATUAIS ----


        tables.forEach((table, tIdx) => {
            const rows: Record<number, Record<number, string>> = {};
            const cellIds = table.Relationships?.[0]?.Ids || [];

            cellIds.forEach(id => {
                const cell = blocks.find(b => b.Id === id);
                if (cell && cell.RowIndex !== undefined && cell.ColumnIndex !== undefined) {
                    const txt = blocks
                        .filter(b => cell.Relationships?.[0]?.Ids?.includes(b.Id || ""))
                        .map(b => b.Text).join(" ").trim();
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
                        extratoFinal.push({
                            id: `it-${tIdx}-${idx}-${Math.random()}`,
                            data: dataCorrente,
                            descricao: r[2] || "LANÇAMENTO ITAU",
                            valor: vS !== 0 ? -Math.abs(vS) : vE
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
                        .replace(/\s+/g, ' ') 
                        .trim();
                
                    const isSaldo = descFinal.includes("SALDO") || descFinal.includes("S D O");
                
                    if (valorNumerico !== 0 && !isSaldo) {
                        extratoFinal.push({
                            id: `it-ex-${tIdx}-${idx}-${Math.random()}`,
                            data: r[0] || dataCorrente, 
                            descricao: descFinal, 
                            documento: r[3] || "", 
                            valor: valorNumerico,
                            nomeBanco: "ITAÚ"
                        });
                    }
                }

                else if (eBB) {
                    const valorBruto = r[5] || "";
                    const descricao = r[4] || "";

                    const ehSaldo = descricao.toLowerCase().includes("saldo");

                    if (valorBruto && !ehSaldo) {
                        let valorNumerico = converterValor(valorBruto.replace(/[()+]/g, '').replace('-', '').trim());

                        if (valorBruto.includes("-")) {
                            valorNumerico = -Math.abs(valorNumerico);
                        }

                        if (valorNumerico !== 0) {
                            extratoFinal.push({
                                id: `bb-${tIdx}-${idx}-${Math.random()}`,
                                data: dataCorrente,
                                descricao: descricao.toUpperCase().trim(),
                                valor: valorNumerico
                            });
                        }
                    }
                }
                else if (eBradesco || eSantander || credCrea) {
                    const vE = converterValor(r[4]);
                    const vS = converterValor(r[5]);

                    if (vE !== 0 || vS !== 0) {
                        const nomeBanco = eBradesco ? "BRADESCO" : eSantander ? "SANTANDER" : "CREDCREA";

                        extratoFinal.push({
                            id: `gen-${tIdx}-${idx}-${Math.random()}`,
                            data: dataCorrente,
                            descricao: r[2] || `LANÇAMENTO ${nomeBanco}`,
                            valor: vS !== 0 ? -Math.abs(vS) : vE
                        });
                    }
                }
                else if (eCaixa) {

                    const valorBruto = r[6] || "";
                    const descricao = r[3] || "";


                    const descReal = descricao || r[3] || "LANÇAMENTO CAIXA";

                    if (valorBruto && !descReal.includes("SALDO")) {
                        let valorNumerico = converterValor(valorBruto.replace(/[CD]/g, '').trim());
                        if (valorBruto.toUpperCase().includes("D")) valorNumerico = -Math.abs(valorNumerico);

                        if (valorNumerico !== 0) {
                            extratoFinal.push({
                                id: `cx-${tIdx}-${idx}-${Math.random()}`,
                                data: dataCorrente,
                                descricao: descReal.toUpperCase(),
                                valor: valorNumerico
                            });
                        }
                    }
                }

                // A TRABALHAR PUXANDO SO VALORES NEGATIVOS
                else if (eSicoob) {
                    const valorBruto = r[5] || "";
                    const descricao = r[3] || "";

                    if (valorBruto && !descricao.toUpperCase().includes("SALDO")) {

                        const ehDebito = valorBruto.toUpperCase().includes("D");

                        const valorLimpo = valorBruto
                            .replace(/R\$/g, '')
                            .replace(/[a-zA-Z]/g, '')
                            .trim();

                        let valorNumerico = converterValor(valorLimpo);

                        if (ehDebito) {
                            valorNumerico = -Math.abs(valorNumerico);
                        } else {
                            valorNumerico = Math.abs(valorNumerico);
                        }

                        if (valorNumerico !== 0) {
                            extratoFinal.push({
                                id: `SB-${tIdx}-${idx}-${Math.random()}`,
                                data: dataCorrente,
                                descricao: descricao.toUpperCase().trim() || "LANÇAMENTO SICOOB",
                                valor: valorNumerico
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

                    let descricaoReal = "LANÇAMENTO INTER";

                    let textoBruto = "";
                    if (r[0] && !r[0].includes("R$") && !r[0].includes(" de ")) {
                        textoBruto = r[0];
                    } else if (r[1] && !r[1].includes("R$")) {
                        textoBruto = r[1];
                    }

                    descricaoReal = descricaoReal.split(":")[0].trim().toUpperCase();

                    let valorBruto = r[2] || r[1] || "";

                    if (valorBruto.includes("R$") && !descricaoReal.toUpperCase().includes("SALDO")) {

                        descricaoReal = textoBruto.trim().toUpperCase();

                        const ehSaida = valorBruto.includes("-");

                        const match = valorBruto.match(/([\d.]+,\d{2})/);

                        if (match) {
                            const apenasNumeros = match[0];
                            let v = converterValor(apenasNumeros);

                            if (ehSaida) v = -Math.abs(v);

                            if (v !== 0) {
                                extratoFinal.push({
                                    id: `inter-${tIdx}-${idx}-${Math.random()}`,
                                    data: dataCorrente,
                                    descricao: descricaoReal.toUpperCase().trim(),
                                    valor: v
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

                        const apenasNumeros = textoValor.replace(/[^\d.,]/g, '');
                        let v = converterValor(apenasNumeros);

                        if (v !== 0) {
                            v = ehEntrada ? Math.abs(v) : -Math.abs(v);

                            extratoFinal.push({
                                id: `nu-${tIdx}-${idx}-${Math.random()}`,
                                data: dataCorrente,
                                descricao: descricaoFinal.trim(),
                                valor: v
                            });
                        }
                    }
                }


            });
        });

        return { success: true, data: extratoFinal, ultimaDataEncontrada: dataCorrente };
    } catch (e) {
        return { success: false, error: "Erro" };
    }
}