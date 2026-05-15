import { GoogleGenerativeAI } from "@google/generative-ai";

export const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const BIBBLE_MODEL = "gemini-flash-latest";
export const BIBBLE_MAX_TOKENS = 1024;
