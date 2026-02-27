import { describe, it, expect, mock, beforeEach } from "bun:test";

mock.module("groq-sdk", () => ({
  default: class MockGroq {
    chat = {
      completions: {
        create: async () => ({
          id: "mock-completion-id",
          choices: [{ message: { content: "Hello from the assistant" } }],
        }),
      },
    };
  },
}));

import { chatService } from "../services/chat.service";
import { conversationRepository } from "../repositories/conversation.repository";

// Wipe all conversations before each test so shared global state
// doesn't bleed between tests.
beforeEach(() => conversationRepository.reset());

const CONVERSATION_ID = "123e4567-e89b-12d3-a456-426614174000";

describe("chatService.sendMessage", () => {
  it("returns the assistant message and a completion id", async () => {
    const response = await chatService.sendMessage("Hi", CONVERSATION_ID);

    expect(response.message).toBe("Hello from the assistant");
    expect(response.id).toBe("mock-completion-id");
  });

  it("appends the user prompt to the conversation history", async () => {
    await chatService.sendMessage("User message", CONVERSATION_ID);

    const history = conversationRepository.getHistory(CONVERSATION_ID);
    expect(history?.some((m) => m.role === "user" && m.content === "User message")).toBe(true);
  });

  it("appends the assistant reply to the conversation history", async () => {
    await chatService.sendMessage("Any prompt", CONVERSATION_ID);

    const history = conversationRepository.getHistory(CONVERSATION_ID);
    expect(history?.some((m) => m.role === "assistant" && m.content === "Hello from the assistant")).toBe(true);
  });

  it("accumulates messages across multiple turns", async () => {
    await chatService.sendMessage("Turn 1", CONVERSATION_ID);
    await chatService.sendMessage("Turn 2", CONVERSATION_ID);

    const history = conversationRepository.getHistory(CONVERSATION_ID);
    expect(history).toHaveLength(4); // 2 user + 2 assistant
  });

  it("creates a new conversation if the conversationId is unknown", async () => {
    const newId = "523e4567-e89b-12d3-a456-426614174004";
    expect(conversationRepository.getHistory(newId)).toBeUndefined();

    await chatService.sendMessage("Hello", newId);

    expect(conversationRepository.getHistory(newId)).toBeDefined();
  });
});