import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Message, UploadedDocument, Language } from '../types';

// Approximate safe limit for input tokens to avoid 429 Resource Exhausted.
// The error log indicated a limit of 250,000 tokens. We set it to 240,000 to be safe.
const MAX_INPUT_TOKENS = 240000;

export const estimateTokenCount = (text: string): number => {
  // A rough estimation: ~4 chars per token for English/Code text
  // For Amharic, it might be different, but this is a safe heuristic for general text
  return Math.ceil(text.length / 4);
};

export const generateRAGResponse = async (
  apiKey: string | undefined,
  history: Message[],
  currentQuery: string,
  documents: UploadedDocument[],
  config: { temperature: number; maxOutputTokens: number },
  language: Language = 'en'
): Promise<string> => {
  
  if (!apiKey) throw new Error("API Key is missing from environment variables.");

  const ai = new GoogleGenAI({ apiKey });

  // 1. Construct the Context with Token Limit Enforcement
  let contextBlock = "";
  let currentTokenCount = 0;
  let truncated = false;

  // Sort documents by importance if needed, but here we take them in order.
  // We stop adding content when we approach the limit to prevent API errors.
  for (const doc of documents) {
    const docHeader = `--- START DOCUMENT: ${doc.name} ---\n`;
    const docFooter = `\n--- END DOCUMENT: ${doc.name} ---`;
    const headerFooterTokens = estimateTokenCount(docHeader + docFooter);
    
    if (currentTokenCount + headerFooterTokens >= MAX_INPUT_TOKENS) {
      truncated = true;
      break; 
    }

    const availableTokens = MAX_INPUT_TOKENS - currentTokenCount - headerFooterTokens;
    
    if (doc.tokens > availableTokens) {
      // Truncate this document to fit
      const charLimit = availableTokens * 4; // approximate chars
      const slicedContent = doc.content.substring(0, charLimit);
      contextBlock += `${docHeader}${slicedContent}\n...[TRUNCATED DUE TO TOKEN LIMIT]...${docFooter}\n\n`;
      currentTokenCount += availableTokens + headerFooterTokens;
      truncated = true;
      break; // Stop processing further documents
    } else {
      contextBlock += `${docHeader}${doc.content}${docFooter}\n\n`;
      currentTokenCount += doc.tokens + headerFooterTokens;
    }
  }

  const langInstruction = language === 'am' 
    ? "IMPORTANT: The user prefers Amharic. Please answer ALL questions in Amharic language, unless specifically asked otherwise." 
    : "Answer in English.";

  const systemInstruction = `You are an intelligent RAG (Retrieval Augmented Generation) assistant. 
  Your goal is to answer the user's question using ONLY the provided documents below.
  
  Instructions:
  1. Analyze the provided documents carefully.
  2. If the answer is found in the documents, provide a clear, concise answer and cite the document name.
  3. If the answer is NOT in the documents, politely state that the information is not available in the knowledge base.
  4. Do not make up information outside of the provided context.
  5. Maintain a helpful and professional tone.
  6. ${langInstruction}
  
  ${truncated ? "Note: Some documents were truncated or omitted because the total content exceeded the quota limit." : ""}

  KNOWLEDGE BASE:
  ${contextBlock}
  `;

  // 2. Format History for Gemini
  // API expects { role: 'user' | 'model', parts: [...] }
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

    return response.text || (language === 'am' ? "ምላሽ ማመንጨት አልተቻለም።" : "I processed the documents but couldn't generate a text response.");
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};