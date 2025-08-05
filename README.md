# 🧪 AI Agent Server - Pluggable Backend with RAG + Memory

A TypeScript-based AI agent server featuring contextual RAG (Retrieval-Augmented Generation), session memory, and a pluggable architecture for extensible functionality.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   HTTP Client   │───▶│   Express API    │───▶│  Agent Service  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                         │
                       ┌─────────────────────────────────┼─────────────────────────────────┐
                       │                                 ▼                                 │
                       │                    ┌─────────────────────┐                      │
                       │                    │   Memory Manager    │                      │
                       │                    │  (Session Storage)  │                      │
                       │                    └─────────────────────┘                      │
                       │                                 │                                 │
                       ▼                                 ▼                                 ▼
              ┌─────────────────┐           ┌─────────────────────┐           ┌─────────────────┐
              │  Vector Store   │           │   Plugin Manager    │           │   LLM Service   │
              │ (Custom Cosine) │           │                     │           │    (Gemini)     │
              └─────────────────┘           └─────────────────────┘           └─────────────────┘
                       │                                 │
                       ▼                                 ▼
              ┌─────────────────┐           ┌─────────────────────┐
              │   Embeddings    │           │     Plugins:        │
              │  (text-embed-   │           │  • Weather Plugin   │
              │   3-small)      │           │  • Math Plugin      │
              └─────────────────┘           └─────────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Gemini API key
- (Optional) OpenWeatherMap API key for real weather data

### Installation

1. **Clone and install dependencies:**

```bash
git clone <your-repo-url>
cd ai-agent-server
npm install
```

2. **Set up environment variables:**

```bash
cp .env.example .env
# Edit .env with your API keys:
# gemini_API_KEY=your_gemini_key_here
# WEATHER_API_KEY=your_weather_key_here (optional)
# PORT=3000
```

3. **Build and run:**

```bash
# Development mode
npm run dev

# Production build
npm run build
npm start
```

## 📡 API Endpoints

### Health Check

```bash
GET /health
```

### Agent Message

```bash
POST /agent/message
Content-Type: application/json

{
  "message": "What is machine learning?",
  "session_id": "user_123"
}
```

**Response:**

```json
{
  "response": "Machine Learning is a subset of AI that enables computers to learn and improve from experience without being explicitly programmed...",
  "session_id": "user_123",
  "plugins_used": [],
  "retrieved_chunks": 2
}
```

## 🧪 Sample Commands

### Basic Knowledge Query

```bash
curl -X POST http://localhost:3000/agent/message \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Explain neural networks",
    "session_id": "demo_session"
  }'
```

### Weather Plugin

```bash
curl -X POST http://localhost:3000/agent/message \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is the weather in Mumbai?",
    "session_id": "demo_session"
  }'
```

### Math Plugin

```bash
curl -X POST http://localhost:3000/agent/message \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Calculate 15 * 8 + 42",
    "session_id": "demo_session"
  }'
```

### Conversation with Memory

```bash
# First message
curl -X POST http://localhost:3000/agent/message \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Tell me about APIs",
    "session_id": "conversation_1"
  }'

# Follow-up (agent remembers context)
curl -X POST http://localhost:3000/agent/message \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What are the different HTTP methods?",
    "session_id": "conversation_1"
  }'
```

# Follow-up (agent remembers context)

curl -X POST http://localhost:3000/agent/message \
 -H "Content-Type: application/json" \
 -d '{
"message": "What was my last message?",
"session_id": "conversation_1"
}'

````

## 🔧 Core Features

### 🧠 LLM Integration
- **gemini** for natural language generation
- Custom system prompts with context injection
- Conversation-aware responses

### 📚 RAG (Retrieval-Augmented Generation)
- **Custom vector store** using cosine similarity
- Text embedding via gemini's `gemini-embedding-001`
- Automatic document chunking and indexing
- Top-K similarity retrieval (default: 3 chunks)

### 💾 Session Memory
- Per-session conversation history
- Last 4 messages included in context
- Automatic memory management (20 message limit)

### 🔌 Plugin System
- **Weather Plugin**: Real weather data (OpenWeatherMap) or mock data
- **Math Plugin**: Safe mathematical expression evaluation
- Intent-based plugin detection
- Extensible plugin architecture

### 📖 Knowledge Base
Includes 5 pre-loaded documents:
- AI Fundamentals (ML, Neural Networks, Deep Learning)
- Web Development (Frontend/Backend technologies)
- API Design (REST principles, HTTP methods)
- Cloud Computing (IaaS, PaaS, SaaS)
- Data Structures & Algorithms (Arrays, Trees, Big O)

## 🛠️ Technical Implementation

### Vector Store
- **Custom TypeScript implementation** (no external vector DB)
- Cosine similarity for document retrieval
- Automatic document processing and chunking
- In-memory storage with fast similarity search

### Plugin Architecture
```typescript
interface PluginResult {
  plugin_name: string;
  result: any;
  error?: string;
}

// Plugin detection via regex patterns
// Execution results fed into LLM context
````

### Memory Management

```typescript
interface SessionMemory {
  messages: Array<{
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
  }>;
}
```

### Prompt Engineering

System prompt includes:

- Agent instructions and personality
- Retrieved knowledge base context
- Plugin execution results
- Recent conversation history

## 🌐 Deployment

### Local Development

```bash
npm run dev  # Runs on http://localhost:3000
```

### Production Deployment

Recommended platforms:

- **Render**: `render.com`
- **Railway**: `railway.app`
- **Vercel**: `vercel.com`
- **Replit**: `replit.com`

Example deployment configuration:

```bash
# Build command
npm run build

# Start command
npm start

# Environment variables
gemini_API_KEY=<your_key>
WEATHER_API_KEY=<optional>
PORT=3000
NODE_ENV=production
```

## 🧪 Testing Examples

### Postman Collection

Import this JSON for quick testing:

```json
{
  "info": {
    "name": "AI Agent Server",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "{{base_url}}/health",
          "host": ["{{base_url}}"],
          "path": ["health"]
        }
      }
    },
    {
      "name": "Knowledge Query",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"message\": \"What is machine learning?\",\n  \"session_id\": \"test_session\"\n}"
        },
        "url": {
          "raw": "{{base_url}}/agent/message",
          "host": ["{{base_url}}"],
          "path": ["agent", "message"]
        }
      }
    },
    {
      "name": "Weather Plugin",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"message\": \"What's the weather in Bangalore?\",\n  \"session_id\": \"test_session\"\n}"
        },
        "url": {
          "raw": "{{base_url}}/agent/message",
          "host": ["{{base_url}}"],
          "path": ["agent", "message"]
        }
      }
    },
    {
      "name": "Math Plugin",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"message\": \"Calculate 25 * 4 + 10\",\n  \"session_id\": \"test_session\"\n}"
        },
        "url": {
          "raw": "{{base_url}}/agent/message",
          "host": ["{{base_url}}"],
          "path": ["agent", "message"]
        }
      }
    }
  ],
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:3000"
    }
  ]
}
```

## 🔍 Error Handling

The server includes comprehensive error handling:

- **400 Bad Request**: Missing required fields
- **500 Internal Server Error**: LLM failures, plugin errors
- **Graceful degradation**: Plugins fail safely, mock data fallbacks
- **Logging**: Detailed error logging for debugging

## 📈 Performance & Scalability

### Current Limitations

- In-memory storage (sessions + vector store)
- Single-instance deployment
- No persistent storage

### Production Considerations

- Add Redis for session storage
- Implement proper vector database (Pinecone, Weaviate)
- Add rate limiting and authentication
- Implement caching layers
- Add monitoring and observability

## 🛡️ Security Notes

- Input validation on all endpoints
- Safe math evaluation (no `eval()`)
- API key protection via environment variables
- CORS enabled for cross-origin requests

## 📝 Development Notes

### Adding New Plugins

1. Create plugin class in `src/plugins/`
2. Implement `execute(query: string): Promise<PluginResult>`
3. Add detection logic to `PluginManager`
4. Test with sample queries

### Extending Knowledge Base

1. Add markdown/text files to `src/documents/`
2. Restart server (auto-indexes new documents)
3. Verify retrieval with relevant queries

---

## 🚀 Live Demo

**Deployed URL**: `[Add your deployment URL here]`

**Test Command**:

```bash
curl -X POST [your-deployment-url]/agent/message \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello! Tell me about cloud computing.",
    "session_id": "demo"
  }'
```
