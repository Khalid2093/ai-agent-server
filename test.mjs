import { GoogleGenAI } from "@google/genai";

async function main() {
  const ai = new GoogleGenAI({
    apiKey: "AIzaSyC5_3xFG6rRMkVNHNHCzJda4yfFJUcuGtM",
  });

  const response = await ai.models.embedContent({
    model: "gemini-embedding-001",
    contents: "What is the meaning of life?",
  });

  console.log(response.embeddings);
}

main();
