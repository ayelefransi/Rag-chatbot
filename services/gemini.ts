import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Message, UploadedDocument } from '../types';

// Initialize the client. Note: We create a new instance per request if the key changes, 
// but for simplicity in this service, we'll accept the key as a parameter.

export const generateRAGResponse = async (
  apiKey: string,
  history: Message[],
  currentQuery: string,
  documents: UploadedDocument[],
  config: { temperature: number; maxOutputTokens: number }
): Promise<string> => {
  
  if (!apiKey) throw new Error("API Key is missing");

  const ai = new GoogleGenAI({ apiKey });

  // 1. Construct the Context
  // In a full backend RAG, we would use vector search here. 
  // For this "Serverless RAG" using Gemini 2.5 Flash, we leverage the massive context window (1M tokens).
  // We feed all document text directly into the prompt context.
  
  const contextBlock = documents.map(doc => 
    `--- START DOCUMENT: ${doc.name} ---\n${doc.content}\n--- END DOCUMENT: ${doc.name} ---`
  ).join('\n\n');

  const systemInstruction = `You are an intelligent RAG (Retrieval Augmented Generation) assistant. 
  Your goal is to answer the user's question using ONLY the provided documents below.
  
  Instructions:
  1. Analyze the provided documents carefully.
  2. If the answer is found in the documents, provide a clear, concise answer and cite the document name.
  3. If the answer is NOT in the documents, politely state that the information is not available in the knowledge base.
  4. Do not make up information outside of the provided context.
  5. Maintain a helpful and professional tone.
  
  KNOWLEDGE BASE:
  ${contextBlock}
  `;

  // 2. Format History for Gemini
  // API expects { role: 'user' | 'model', parts: [...] }
  // We limit history to last 10 turns to keep focus sharp, though 2.5 Flash can handle much more.
  const contents = history.slice(-10).map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.content }]
  }));

  // Add the current user query
  contents.push({
    role: 'user',
    parts: [{ text: currentQuery }]
  });

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: config.temperature,
        maxOutputTokens: config.maxOutputTokens,
      },
    });

    return response.text || "I processed the documents but couldn't generate a text response.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const estimateTokenCount = (text: string): number => {
  // A rough estimation: ~4 chars per token for English text
  return Math.ceil(text.length / 4);
};