import { SessionMemory } from "../types";

export class MemoryManager {
  private sessions: Map<string, SessionMemory> = new Map();

  addMessage(
    sessionId: string,
    role: "user" | "assistant",
    content: string
  ): void {
    if (!this.sessions.has(sessionId)) {
      this.sessions.set(sessionId, { messages: [] });
    }

    const session = this.sessions.get(sessionId)!;
    session.messages.push({
      role,
      content,
      timestamp: new Date(),
    });

    // Keep only last 20 messages to prevent memory bloat
    if (session.messages.length > 20) {
      session.messages = session.messages.slice(-20);
    }
  }

  getRecentMessages(
    sessionId: string,
    count: number = 4
  ): Array<{ role: string; content: string }> {
    const session = this.sessions.get(sessionId);
    if (!session) return [];

    return session.messages
      .slice(-count)
      .map((msg) => ({ role: msg.role, content: msg.content }));
  }

  getSession(sessionId: string): SessionMemory | undefined {
    return this.sessions.get(sessionId);
  }
}
