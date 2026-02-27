import { describe, it, expect, mock, spyOn, beforeEach, afterEach } from "bun:test";
import type { Request, Response } from "express";

// Prevent Groq constructor from throwing — controller imports chat.service
// which imports groq-sdk at the module level indirectly via lazy init.
mock.module("groq-sdk", () => ({
  default: class MockGroq {
    chat = {
      completions: {
        create: async () => ({ id: "", choices: [{ message: { content: "" } }] }),
      },
    };
  },
}));

import { chatController } from "../controllers/chat.controller";
import { chatService } from "../services/chat.service";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function mockResponse() {
  const res = {
    status: mock(() => res),
    json: mock(() => res),
  } as unknown as Response;
  return res;
}

function mockRequest(body: unknown): Request {
  return { body } as Request;
}

const VALID_BODY = {
  prompt: "Hello",
  conversationId: "123e4567-e89b-12d3-a456-426614174000",
};

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("chatController.sendMessage", () => {
  // Use spyOn instead of mock.module so the mock doesn't bleed
  // into other test files and can be scoped per-test.
  let sendMessageSpy: ReturnType<typeof spyOn>;

  beforeEach(() => {
    sendMessageSpy = spyOn(chatService, "sendMessage").mockResolvedValue({
      id: "mock-id",
      message: "Mocked assistant reply",
    });
  });

  afterEach(() => {
    sendMessageSpy.mockRestore();
  });

  describe("valid request", () => {
    it("responds with 200 and the assistant message", async () => {
      const req = mockRequest(VALID_BODY);
      const res = mockResponse();

      await chatController.sendMessage(req, res);

      expect(res.json).toHaveBeenCalledWith({
        message: "Mocked assistant reply",
        conversationId: VALID_BODY.conversationId,
      });
    });
  });

  describe("invalid request — missing prompt", () => {
    it("responds with 400", async () => {
      const req = mockRequest({ conversationId: VALID_BODY.conversationId });
      const res = mockResponse();

      await chatController.sendMessage(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe("invalid request — prompt too long", () => {
    it("responds with 400 when prompt exceeds 1000 characters", async () => {
      const req = mockRequest({ ...VALID_BODY, prompt: "a".repeat(1001) });
      const res = mockResponse();

      await chatController.sendMessage(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe("invalid request — bad conversationId", () => {
    it("responds with 400 when conversationId is not a valid UUID", async () => {
      const req = mockRequest({ ...VALID_BODY, conversationId: "not-a-uuid" });
      const res = mockResponse();

      await chatController.sendMessage(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe("service error", () => {
    it("responds with 500 when chatService throws", async () => {
      sendMessageSpy.mockRejectedValue(new Error("Groq is down"));

      const req = mockRequest(VALID_BODY);
      const res = mockResponse();

      await chatController.sendMessage(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Error processing chat request" });
    });
  });
});