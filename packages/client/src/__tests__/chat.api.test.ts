import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { sendMessage } from "../api/chat.api";

describe("sendMessage", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    globalThis.fetch = fetchMock;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("sends POST with correct headers and body", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: "Paris", conversationId: "abc-123" }),
    });

    await sendMessage({ prompt: "Capital of France?", conversationId: "abc-123" });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/chat"),
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
    );
  });

  it("returns parsed response on success", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: "Paris", conversationId: "abc-123" }),
    });

    const result = await sendMessage({
      prompt: "Capital of France?",
      conversationId: "abc-123",
    });

    expect(result.message).toBe("Paris");
    expect(result.conversationId).toBe("abc-123");
  });

  it("throws when response is not ok", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ message: "Invalid prompt" }),
    });

    await expect(
      sendMessage({ prompt: "", conversationId: "abc-123" })
    ).rejects.toThrow("Invalid prompt");
  });

  it("throws generic error when body is not parseable", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => { throw new Error("not json"); },
    });

    await expect(
      sendMessage({ prompt: "hello", conversationId: "abc-123" })
    ).rejects.toThrow("HTTP error 500");
  });
});
