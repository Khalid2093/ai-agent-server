export interface AgentMessage {
  message: string;
  session_id: string;
}

export interface AgentResponse {
  response: string;
  session_id: string;
  plugins_used?: string[];
  retrieved_chunks?: number;
}

export interface SessionMemory {
  messages: Array<{
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
  }>;
}

export interface DocumentChunk {
  id: string;
  content: string;
  embedding: number[];
  metadata: {
    source: string;
    chunk_index: number;
  };
}

export interface PluginResult {
  plugin_name: string;
  result: any;
  error?: string;
}
