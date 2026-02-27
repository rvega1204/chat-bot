# Chat Client

A modern dark-themed chat UI built with **React 19**, **Vite**, and **TypeScript**, powered by a stateful REST API backed by **Groq** (Llama 3.3 70B). Conversations are preserved across multiple turns using `localStorage` for session persistence.

> **Monorepo note:** This is the `client` package. See the [`server`](../server/README.md) package for the API.

---

## Tech Stack

| Concern        | Technology                                                                 |
|----------------|----------------------------------------------------------------------------|
| Runtime        | [Bun](https://bun.sh)                                                      |
| Framework      | [React 19](https://react.dev)                                              |
| Build Tool     | [Vite](https://vitejs.dev)                                                 |
| Language       | TypeScript 5 (strict)                                                      |
| Styling        | [Tailwind CSS v4](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com) |
| Font           | [Inter Variable](https://fontsource.org/fonts/inter) (local, no CDN)      |
| Testing        | [Vitest](https://vitest.dev) + [Testing Library](https://testing-library.com) |

---

## Project Structure

```
client/
├── src/
│   ├── __tests__/
│   │   ├── setup.ts
│   │   ├── chat.api.test.ts
│   │   ├── useChat.test.ts
│   │   ├── MessageBubble.test.tsx
│   │   ├── MessageList.test.tsx
│   │   ├── ChatInput.test.tsx
│   │   └── ChatWindow.test.tsx
│   ├── api/
│   │   └── chat.api.ts
│   ├── components/
│   │   ├── ChatWindow.tsx
│   │   ├── MessageList.tsx
│   │   ├── MessageBubble.tsx
│   │   └── ChatInput.tsx
│   ├── hooks/
│   │   └── useChat.ts
│   ├── types/
│   │   └── chat.types.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── .env
├── vite.config.ts
├── tsconfig.app.json
└── package.json
```

---

## Architecture

The client follows a strict 3-layer separation:

```
UI Components → useChat (hook) → chat.api (fetch)
```

- **Components** — purely presentational, receive props, emit events.
- **`useChat` hook** — owns all state: messages, loading, error, conversationId.
- **`chat.api`** — single responsibility: HTTP communication with the server.

---

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) >= 1.0
- Server running on `http://localhost:3000` (see [`server`](../server/README.md))

### Installation

```bash
bun install
```

### Environment Variables

Create a `.env` file inside `packages/client/`:

```env
VITE_API_URL=http://localhost:3000
```

### Running the Client

```bash
# Development
bun run dev

# Production build
bun run build

# Preview production build
bun run preview
```

---

## API Integration

The client communicates with a single endpoint:

### `POST /api/chat`

```typescript
// Request
{
  "prompt": "What is the capital of France?",
  "conversationId": "123e4567-e89b-12d3-a456-426614174000"
}

// Response
{
  "message": "The capital of France is Paris.",
  "conversationId": "123e4567-e89b-12d3-a456-426614174000"
}
```

The `conversationId` is generated automatically on first load using `crypto.randomUUID()` and persisted in `localStorage`. Every subsequent message reuses the same ID to maintain conversation context.

---

## Features

- **Dark theme** — inspired by Claude, using shadcn/ui CSS variable tokens
- **Multi-turn conversations** — full context preserved across messages
- **Session persistence** — `conversationId` survives page refreshes via `localStorage`
- **Input validation** — minimum 2 characters, maximum 1000, control character sanitization
- **Keyboard support** — `Enter` to send, `Shift+Enter` for new line
- **Loading state** — animated "Thinking..." indicator while awaiting response
- **Error handling** — inline error display on API failure
- **Auto-scroll** — message list scrolls to the latest message automatically
- **Responsive** — mobile-friendly with `md:` breakpoint adjustments
- **About panel** — project info and disclaimer via shadcn Sheet component
- **Offline font** — Inter Variable loaded locally via Fontsource, no CDN dependency

---

## Testing

Tests use **Vitest** with **happy-dom** as the environment and **Testing Library** for component rendering. All external dependencies are mocked — no real network calls are made.

### Running Tests

```bash
# Single run
bun run test

# Watch mode
bun run test:watch
```

### Test Coverage

| File | What is tested |
|---|---|
| `chat.api.test.ts` | POST request shape, success response, HTTP errors, unparseable body |
| `useChat.test.ts` | Initial state, user/assistant messages, multi-turn, error handling, isLoading, localStorage |
| `MessageBubble.test.tsx` | Content rendering, alignment per role, AI avatar visibility |
| `MessageList.test.tsx` | Empty state, message rendering, thinking indicator |
| `ChatInput.test.tsx` | Send on click, Enter key, Shift+Enter, input clear, disabled state, min length, sanitization |
| `ChatWindow.test.tsx` | Happy path, error display, loading indicator |

### Test Setup

`__tests__/setup.ts` is loaded before all tests via `vite.config.ts`. It:
- Imports `@testing-library/jest-dom` matchers
- Provides a full `localStorage` mock (required for Bun + Node v25 compatibility)
- Calls `cleanup()` after each test to prevent DOM leaks

---

## Design Decisions

**Token-based dark theme** — all colors reference shadcn/ui CSS variables (`bg-background`, `text-muted-foreground`, etc.) rather than hardcoded hex values. Changing the theme only requires updating the `.dark` block in `index.css`.

**`useChat` as single source of truth** — components are kept purely presentational. No component manages its own async state or touches `localStorage` directly.

**Local font via Fontsource** — avoids runtime dependency on Google Fonts CDN, which may be blocked in certain network environments.

**`happy-dom` over `jsdom`** — better compatibility with Node v25 Web Storage API and faster test execution.

**Input sanitization** — control characters are stripped before sending to the API to prevent unexpected behavior in the LLM prompt.

---

## Disclaimer

This is a **demo project** built for learning purposes. The AI may produce incorrect or incomplete responses. Please use responsibly and avoid sharing sensitive information.

---

© 2026 Ricardo Vega · All rights reserved
