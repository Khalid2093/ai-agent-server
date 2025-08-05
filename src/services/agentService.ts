import { VectorStore } from "./vectorStore";
import { MemoryManager } from "./memoryManager";
import { PluginManager } from "./pluginManager";
import { LLMService } from "./llmService";
import { AgentMessage, AgentResponse } from "../types";

export class AgentService {
  private vectorStore: VectorStore;
  private memoryManager: MemoryManager;
  private pluginManager: PluginManager;
  private llmService: LLMService;

  constructor() {
    this.vectorStore = new VectorStore();
    this.memoryManager = new MemoryManager();
    this.pluginManager = new PluginManager();
    this.llmService = new LLMService();
  }

  async initialize(): Promise<void> {
    await this.vectorStore.initialize();
    console.log("Agent service initialized");
  }

  async processMessage(request: AgentMessage): Promise<AgentResponse> {
    const { message, session_id } = request;

    try {
      // 1. Retrieve relevant context from knowledge base
      const retrievedChunks = await this.vectorStore.retrieveSimilarChunks(
        message,
        3
      );

      // 2. Get recent conversation history
      const recentMessages = this.memoryManager.getRecentMessages(
        session_id,
        4
      );

      // 3. Execute plugins if needed
      const pluginResults = await this.pluginManager.detectAndExecutePlugins(
        message
      );

      // 4. Generate LLM response
      const response = await this.llmService.generateResponse(
        message,
        recentMessages,
        retrievedChunks,
        pluginResults
      );

      // 5. Store conversation in memory
      this.memoryManager.addMessage(session_id, "user", message);
      this.memoryManager.addMessage(session_id, "assistant", response);

      return {
        response,
        session_id,
        plugins_used: pluginResults.map((r) => r.plugin_name),
        retrieved_chunks: retrievedChunks.length,
      };
    } catch (error) {
      console.error("Error processing message:", error);
      throw new Error("Failed to process message");
    }
  }
}
