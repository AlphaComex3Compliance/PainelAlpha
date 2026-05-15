import { NextRequest } from "next/server";
import { auth } from "../../../../../auth";
import { genAI, BIBBLE_MODEL, BIBBLE_MAX_TOKENS } from "@/lib/bibble/client";
import { BIBBLE_SYSTEM_PROMPT } from "@/lib/bibble/system-prompt";
import { BIBBLE_TOOLS } from "@/lib/bibble/tools";
import { executarTool } from "@/lib/bibble/tool-executor";
import type { Content } from "@google/generative-ai";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

type SSEEvent =
  | { type: "status"; state: string }
  | { type: "text"; text: string }
  | { type: "done" }
  | { type: "error"; message: string };

function sseEncode(data: SSEEvent): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`);
}

interface HistoryMessage {
  role: "user" | "bibble";
  text: string;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const userId = Number(session.user.id);
  const { message, history, context } = (await req.json()) as {
    message: string;
    history: HistoryMessage[];
    context?: Record<string, unknown>;
  };

  if (!message?.trim()) {
    return new Response(JSON.stringify({ error: "Mensagem vazia" }), { status: 400 });
  }

  // Convert frontend history to Gemini Content format
  const geminiHistory: Content[] = (history || [])
    .slice(-10)
    .map((m) => ({
      role: m.role === "bibble" ? "model" : "user",
      parts: [{ text: m.text }],
    }));

  const userContent = context?.urlAtual
    ? `[Página atual: ${context.urlAtual}]\n\n${message}`
    : message;

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: SSEEvent) => controller.enqueue(sseEncode(event));

      try {
        const model = genAI.getGenerativeModel({
          model: BIBBLE_MODEL,
          systemInstruction: BIBBLE_SYSTEM_PROMPT,
          tools: BIBBLE_TOOLS,
          generationConfig: { maxOutputTokens: BIBBLE_MAX_TOKENS, temperature: 0.7 },
        });

        // Build the full contents array (history + current message)
        const contents: Content[] = [
          ...geminiHistory,
          { role: "user", parts: [{ text: userContent }] },
        ];

        send({ type: "status", state: "thinking" });

        const MAX_TOOL_TURNS = 5;

        for (let turn = 0; turn <= MAX_TOOL_TURNS; turn++) {
          const result = await model.generateContent({ contents });
          const response = result.response;
          const functionCalls = response.functionCalls();

          if (!functionCalls || functionCalls.length === 0) {
            // Final text response
            const text = response.text();
            send({ type: "text", text });
            break;
          }

          // Tool use turn
          send({ type: "status", state: "pesquisando" });

          // Preserve original model parts (includes thought_signature required by gemini-flash-latest)
          contents.push({
            role: "model",
            parts: result.response.candidates![0].content.parts,
          });

          // Execute all tools in parallel
          const functionResponseParts = await Promise.all(
            functionCalls.map(async (fc) => {
              const toolResult = await executarTool(
                fc.name,
                fc.args as Record<string, unknown>,
                userId
              );
              return {
                functionResponse: {
                  name: fc.name,
                  response: { result: toolResult },
                },
              };
            })
          );

          // Add user turn (with function responses) to contents
          contents.push({ role: "user", parts: functionResponseParts });
        }

        send({ type: "done" });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Erro interno";
        console.error("BIBBLE GEMINI ERROR:", msg);
        send({ type: "error", message: "Tive um problema aqui. Tenta de novo." });
        send({ type: "done" });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
