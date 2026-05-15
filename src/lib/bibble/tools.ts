import { Tool, SchemaType } from "@google/generative-ai";

export const BIBBLE_TOOLS: Tool[] = [
  {
    functionDeclarations: [
      {
        name: "buscar_empresa",
        description:
          "Consulta dados de uma empresa via CNPJ: razão social, situação RADAR Aduaneiro, regime tributário, capital social, município, UF e data de constituição. Use quando o usuário mencionar um CNPJ ou pedir informações sobre uma empresa.",
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            cnpj: {
              type: SchemaType.STRING,
              description:
                "CNPJ da empresa — pode ser formatado (XX.XXX.XXX/XXXX-XX) ou só números",
            },
          },
          required: ["cnpj"],
        },
      },
      {
        name: "listar_clientes",
        description:
          "Busca clientes cadastrados no PainelAlpha pelo nome, nome fantasia ou CNPJ. Retorna status, regime tributário e analista responsável.",
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            busca: {
              type: SchemaType.STRING,
              description: "Texto parcial para buscar — pode ser nome da empresa ou CNPJ",
            },
            limite: {
              type: SchemaType.NUMBER,
              description: "Máximo de resultados a retornar (padrão: 5, máximo: 10)",
            },
          },
          required: ["busca"],
        },
      },
      {
        name: "abrir_chamado",
        description:
          "Cria um chamado de suporte no sistema. Use quando o usuário relatar um erro, bug ou problema que precise de atenção da equipe.",
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            titulo: {
              type: SchemaType.STRING,
              description: "Título resumido do problema (máximo 100 caracteres)",
            },
            descricao: {
              type: SchemaType.STRING,
              description: "Descrição detalhada do problema relatado",
            },
            prioridade: {
              type: SchemaType.STRING,
              description:
                "Prioridade do chamado: BAIXA, MEDIA, ALTA ou URGENTE",
            },
          },
          required: ["titulo", "descricao", "prioridade"],
        },
      },
    ],
  },
];
