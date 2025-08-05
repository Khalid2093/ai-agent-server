import { GoogleGenAI, EmbedContentResponse } from "@google/genai";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

// Load API key from environment variable for security
const apiKey: string = process.env.GEMINI_API_KEY ?? "";

if (!apiKey) {
  throw new Error("GEMINI_API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey });

export async function generateEmbedding(text: string): Promise<any> {
  try {
    // Prepare the embedding request
    const request = {
      model: "gemini-embedding-001", // Embedding model identifier
      contents: [text], // Array of strings to embed
    };

    // Call the embedContent method and await the response
    const response: EmbedContentResponse = await ai.models.embedContent(
      request
    );

    return response.embeddings;
  } catch (error) {
    console.error("Error generating embeddings:", error);
    throw error;
  }
}

async function main(): Promise<void> {
  // Initialize the Google Generative AI client with the API key

  // Prepare the embedding request
  const request = {
    model: "gemini-embedding-001", // Embedding model identifier
    contents: ["What is the meaning of life?"], // Array of strings to embed
  };

  // Call the embedContent method and await the response
  const response: EmbedContentResponse = await ai.models.embedContent(request);

  // response.embeddings is a 2D array: one embedding per input content
  console.log("Embeddings:", response.embeddings);
}

export function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}
