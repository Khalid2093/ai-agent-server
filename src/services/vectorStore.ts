// Complete updated src/services/vectorStore.ts
import { DocumentChunk } from "../types";
import { generateEmbedding, cosineSimilarity } from "../utils/embeddings";
import * as fs from "fs-extra";
import * as path from "path";

export class VectorStore {
  private chunks: DocumentChunk[] = [];
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    console.log("Initializing vector store...");
    await this.loadDocuments();
    this.isInitialized = true;
    console.log(`Vector store initialized with ${this.chunks.length} chunks`);
  }

  private async loadDocuments(): Promise<void> {
    const docsPath = path.join(__dirname, "../../src/documents");

    // Check if documents folder exists
    if (!(await fs.pathExists(docsPath))) {
      throw new Error(`Documents folder not found at: ${docsPath}`);
    }

    // Read all files from documents folder
    const files = await fs.readdir(docsPath);
    const textFiles = files.filter(
      (f) =>
        f.endsWith(".md") ||
        f.endsWith(".txt") ||
        f.endsWith(".json") ||
        f.endsWith(".csv")
    );

    if (textFiles.length === 0) {
      console.warn("No readable files found in documents folder");
      return;
    }

    console.log(`Found ${textFiles.length} files to process:`, textFiles);

    for (const file of textFiles) {
      try {
        const filePath = path.join(docsPath, file);
        const content = await fs.readFile(filePath, "utf-8");

        if (content.trim().length === 0) {
          console.warn(`Skipping empty file: ${file}`);
          continue;
        }

        console.log(`Processing ${file}...`);
        await this.processDocument(content, file);
      } catch (error) {
        console.error(`Error reading file ${file}:`, error);
      }
    }
  }

  private async processDocument(
    content: string,
    filename: string
  ): Promise<void> {
    // Simple chunking strategy: split by paragraphs and sentences
    const chunks = this.chunkText(content, 300); // ~300 chars per chunk

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      if (chunk.trim().length < 50) continue; // Skip very short chunks

      try {
        const embedding = await generateEmbedding(chunk);

        this.chunks.push({
          id: `${filename}_chunk_${i}`,
          content: chunk,
          embedding,
          metadata: {
            source: filename,
            chunk_index: i,
          },
        });

        // Add small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Error processing chunk ${i} from ${filename}:`, error);
      }
    }
  }

  private chunkText(text: string, maxChunkSize: number): string[] {
    // First try to split by double newlines (paragraphs)
    let paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim());

    // If no paragraphs found, split by single newlines
    if (paragraphs.length === 1) {
      paragraphs = text.split("\n").filter((p) => p.trim());
    }

    const chunks: string[] = [];
    let currentChunk = "";

    for (const paragraph of paragraphs) {
      // If single paragraph is too long, split by sentences
      if (paragraph.length > maxChunkSize) {
        if (currentChunk) {
          chunks.push(currentChunk.trim());
          currentChunk = "";
        }

        const sentences = paragraph.split(/[.!?]+/).filter((s) => s.trim());
        for (const sentence of sentences) {
          if (
            currentChunk.length + sentence.length > maxChunkSize &&
            currentChunk
          ) {
            chunks.push(currentChunk.trim());
            currentChunk = sentence.trim();
          } else {
            currentChunk += (currentChunk ? ". " : "") + sentence.trim();
          }
        }
      } else {
        // Check if adding this paragraph exceeds chunk size
        if (
          currentChunk.length + paragraph.length > maxChunkSize &&
          currentChunk
        ) {
          chunks.push(currentChunk.trim());
          currentChunk = paragraph;
        } else {
          currentChunk += (currentChunk ? "\n\n" : "") + paragraph;
        }
      }
    }

    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }

    return chunks.filter((chunk) => chunk.length > 0);
  }

  async retrieveSimilarChunks(
    query: string,
    topK: number = 3
  ): Promise<DocumentChunk[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (this.chunks.length === 0) {
      console.warn("No chunks available for similarity search");
      return [];
    }

    const queryEmbedding = await generateEmbedding(query);

    const similarities = this.chunks.map((chunk) => ({
      chunk,
      similarity: cosineSimilarity(queryEmbedding, chunk.embedding),
    }));

    similarities.sort((a, b) => b.similarity - a.similarity);

    console.log(
      `Retrieved ${Math.min(
        topK,
        similarities.length
      )} chunks for query: "${query}"`
    );

    return similarities.slice(0, topK).map((item) => item.chunk);
  }

  // Utility method to get stats about the vector store
  getStats(): { totalChunks: number; filesSources: string[] } {
    const sources = [
      ...new Set(this.chunks.map((chunk) => chunk.metadata.source)),
    ];
    return {
      totalChunks: this.chunks.length,
      filesSources: sources,
    };
  }
}
