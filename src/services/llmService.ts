import OpenAI from "openai";
import { DocumentChunk, PluginResult } from "../types";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

const openai = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY ?? "",
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

export class LLMService {
  async generateResponse(
    userMessage: string,
    recentMessages: Array<{ role: string; content: string }>,
    retrievedChunks: DocumentChunk[],
    pluginResults: PluginResult[]
  ): Promise<string> {
    const systemPrompt = this.buildSystemPrompt(retrievedChunks, pluginResults);
    const conversationHistory = this.buildConversationHistory(recentMessages);

    try {
      const response = await openai.chat.completions.create({
        model: "gemini-2.5-flash",
        reasoning_effort: "low",
        messages: [
          { role: "system", content: systemPrompt },
          ...conversationHistory,
          { role: "user", content: userMessage },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      return (
        response.choices[0].message.content ||
        "I apologize, but I couldn't generate a response."
      );
    } catch (error) {
      console.error("Error generating LLM response:", error);
      throw new Error("Failed to generate response from LLM");
    }
  }

  private buildSystemPrompt(
    retrievedChunks: DocumentChunk[],
    pluginResults: PluginResult[]
  ): string {
    let prompt = `You are an intelligent AI assistant with access to a knowledge base and various tools. Your role is to provide helpful, accurate, and contextual responses to user queries.

INSTRUCTIONS:
1. Use the provided context from the knowledge base to inform your responses
2. If plugin results are available, incorporate them naturally into your response
3. Be conversational but informative
4. If you don't know something or if information isn't in the provided context, say so
5. Keep responses concise but thorough

`;

    // Add retrieved context
    if (retrievedChunks.length > 0) {
      prompt += `KNOWLEDGE BASE CONTEXT:
`;
      retrievedChunks.forEach((chunk, index) => {
        prompt += `Context ${index + 1} (from ${chunk.metadata.source}):
${chunk.content}

`;
      });
    }

    // Add plugin results
    if (pluginResults.length > 0) {
      prompt += `TOOL RESULTS:
`;
      pluginResults.forEach((result, index) => {
        if (result.error) {
          prompt += `Tool ${index + 1} (${result.plugin_name}): Error - ${
            result.error
          }
`;
        } else {
          prompt += `Tool ${index + 1} (${
            result.plugin_name
          }): ${JSON.stringify(result.result, null, 2)}
`;
        }
      });
    }

    return prompt;
  }

  private buildConversationHistory(
    recentMessages: Array<{ role: string; content: string }>
  ): Array<{ role: "user" | "assistant"; content: string }> {
    return recentMessages.map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    }));
  }
}
