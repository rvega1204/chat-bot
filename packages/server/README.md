# Chat API Server

A stateful multi-turn chat REST API built with **Bun**, **Express**, and **TypeScript**, powered by **Groq** (Llama 3.3 70B). Conversations are kept in memory, giving the model full context across multiple turns in the same session.

> **Monorepo note:** This is the `server` package. A client package is planned — see [TODO: Client](#todo-client).

---

## Tech Stack

| Concern | Technology |
|---|---|
| Runtime | [Bun](https://bun.sh) |
| Framework | [Express 5](https://expressjs.com) |
| Language | TypeScript 5 (strict) |
| LLM Provider | [Groq SDK](https://console.groq.com) — Llama 3.3 70B |
| Validation | [Zod 4](https://zod.dev) |
| Rate Limiting | [express-rate-limit](https://github.com/express-rate-limit/express-rate-limit) |
| Testing | [Bun Test](https://bun.sh/docs/cli/test) |

---

## Project Structure

```
server/
├── __tests__/
│   ├── setup.ts                         # Preloads dummy env vars before any test runs
│   ├── chat.controller.test.ts          # Controller unit tests
│   ├── chat.service.test.ts             # Service unit tests (Groq mocked)
│   └── conversation.repository.test.ts  # Repository unit tests
├── controllers/
│   └── chat.controller.ts               # Validates requests, delegates to service
├── repositories/
│   └── conversation.repository.ts       # In-memory conversation store
├── services/
│   └── chat.service.ts                  # Manages history and calls Groq API
├── .env                                 # Environment variables (not committed)
├── bunfig.toml                          # Bun test configuration
├── index.ts                             # Server entry point
├── routes.ts                            # Route definitions
├── package.json
└── tsconfig.json
```

---

## Architecture

The project follows a strict 3-layer architecture where each layer has a single responsibility:

```
Request → Router → Controller → Service → Repository
```

- **Controller** — validates the incoming request body with Zod and handles HTTP responses.
- **Service** — owns business logic: manages conversation history and communicates with the Groq API.
- **Repository** — abstracts the in-memory store; the only layer allowed to read or write conversation data.

---

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) >= 1.0
- A [Groq API key](https://console.groq.com)

### Installation

```bash
bun install
```

### Environment Variables

Create a `.env` file inside `packages/server/`:

```env
GROQ_API_KEY=your_api_key_here
PORT=3000        # optional, defaults to 3000
```

### Running the Server

```bash
# Development (watch mode)
bun dev

# Production
bun start
```

---

## API Reference

### `POST /api/chat`

Send a message and receive a response from the LLM. Pass the same `conversationId` on every request to maintain conversation context.

**Request body**

```json
{
  "prompt": "What is the capital of France?",
  "conversationId": "123e4567-e89b-12d3-a456-426614174000"
}
```

| Field | Type | Rules |
|---|---|---|
| `prompt` | `string` | Required, 1–1000 characters |
| `conversationId` | `string` | Required, valid UUID v4 |

**Success response** `200 OK`

```json
{
  "message": "The capital of France is Paris.",
  "conversationId": "123e4567-e89b-12d3-a456-426614174000"
}
```

**Error responses**

| Status | Cause |
|---|---|
| `400` | Validation failed (missing field, bad UUID, prompt too long) |
| `429` | Rate limit exceeded (100 requests / 15 min per IP) |
| `500` | Unexpected server or Groq API error |

---

## Testing

Tests are written with the built-in Bun test runner. All external dependencies (Groq SDK, chatService) are mocked so tests never make real network calls.

### Running tests

```bash
bun test

# Watch mode
bun test --watch
```

### Test setup

`__tests__/setup.ts` is preloaded via `bunfig.toml` before any test file runs. It sets a dummy `GROQ_API_KEY` so the Groq SDK doesn't throw at instantiation time — the real key is never needed during tests since the client is fully mocked.

### Test coverage

#### `conversation.repository.test.ts`
Tests the in-memory store in complete isolation.

| Test | Description |
|---|---|
| `getHistory` returns `undefined` for unknown IDs | Verifies missing conversations return nothing |
| `getHistory` returns array after creation | Confirms the entry exists after `getOrCreateHistory` |
| `getHistory` returns the same array reference | Ensures mutations via the returned ref are visible |
| `getOrCreateHistory` initializes an empty array | New conversations start with no messages |
| `getOrCreateHistory` doesn't reset existing history | Calling it twice preserves messages |
| Conversations are isolated from one another | Writing to conversation A doesn't affect conversation B |

#### `chat.service.test.ts`
Groq SDK is mocked via `mock.module`. The Groq client uses **lazy initialization** in `chat.service.ts` so the mock is registered before the constructor ever runs.

| Test | Description |
|---|---|
| Returns message and completion ID | Verifies the service returns the mocked LLM response |
| Appends user prompt to history | Confirms the user turn is persisted |
| Appends assistant reply to history | Confirms the assistant turn is persisted |
| Accumulates messages across turns | After 2 turns, history has 4 entries |
| Creates new conversation automatically | Service calls `getOrCreateHistory`, not the controller |

#### `chat.controller.test.ts`
`chatService.sendMessage` is intercepted with `spyOn` (not `mock.module`) to avoid polluting other test files.

| Test | Description |
|---|---|
| Valid request → 200 with message | Happy path response shape |
| Missing prompt → 400 | Zod catches empty/absent prompt |
| Prompt too long → 400 | Zod enforces 1000-char max |
| Invalid UUID → 400 | Zod enforces UUID v4 format |
| Service throws → 500 | Controller catches and returns generic error |

---

## Design Decisions

**Lazy Groq client initialization** — `chat.service.ts` creates the Groq client inside a `getClient()` function rather than at module level. This means `import`ing the service never triggers the SDK constructor, which makes mocking in tests straightforward without needing dynamic imports or complex setup.

**`spyOn` over `mock.module` for the controller test** — `mock.module` in Bun is global and persists across test files. Using `spyOn` with `mockRestore()` in `afterEach` keeps mocks scoped to individual tests and prevents state leaking between files.

**`reset()` on the repository** — the in-memory `Map` is global within the process, so tests share state by default. Exposing a `reset()` method (called in `beforeEach`) ensures each test starts with a clean slate.

---

## License
Educational Use Only License

© 2026 Ricardo Vega. All rights reserved.

This project is provided strictly for educational and non-commercial purposes.