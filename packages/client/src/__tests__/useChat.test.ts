// @vitest-environment jsdom
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useChat } from "../hooks/useChat";
import * as chatApi from "../api/chat.api";

describe("useChat", () => {
  const sendMessageMock = vi.fn();

  beforeEach(() => {
    sendMessageMock.mockReset();
    // Limpia el store de localStorage directamente sin .clear()
    Object.keys(localStorage).forEach((key) => localStorage.removeItem(key));
    vi.spyOn(chatApi, "sendMessage").mockImplementation(sendMessageMock);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("starts with empty messages, not loading, no error", () => {
    const { result } = renderHook(() => useChat());

    expect(result.current.messages).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("appends user message immediately", async () => {
    sendMessageMock.mockResolvedValueOnce({
      message: "Paris",
      conversationId: "abc-123",
    });

    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.sendPrompt("Capital of France?");
    });

    expect(result.current.messages[0]).toEqual({
      role: "user",
      content: "Capital of France?",
    });
  });

  it("appends assistant message after API resolves", async () => {
    sendMessageMock.mockResolvedValueOnce({
      message: "Paris",
      conversationId: "abc-123",
    });

    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.sendPrompt("Capital of France?");
    });

    expect(result.current.messages[1]).toEqual({
      role: "assistant",
      content: "Paris",
    });
  });

  it("accumulates messages across multiple turns", async () => {
    sendMessageMock
      .mockResolvedValueOnce({ message: "Paris", conversationId: "abc" })
      .mockResolvedValueOnce({ message: "It is in France", conversationId: "abc" });

    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.sendPrompt("Capital of France?");
    });

    await act(async () => {
      await result.current.sendPrompt("Where is it?");
    });

    expect(result.current.messages).toHaveLength(4);
  });

  it("sets error and keeps user message when API throws", async () => {
    sendMessageMock.mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.sendPrompt("Hello");
    });

    expect(result.current.error).toBe("Network error");
    expect(result.current.messages).toHaveLength(1);
  });

  it("clears error on next successful send", async () => {
    sendMessageMock
      .mockRejectedValueOnce(new Error("Network error"))
      .mockResolvedValueOnce({ message: "Hi", conversationId: "abc" });

    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.sendPrompt("Hello");
    });

    expect(result.current.error).toBe("Network error");

    await act(async () => {
      await result.current.sendPrompt("Hello again");
    });

    expect(result.current.error).toBeNull();
  });

  it("sets isLoading to true while waiting and false after", async () => {
    let resolvePromise!: (value: Awaited<ReturnType<typeof chatApi.sendMessage>>) => void;

    sendMessageMock.mockImplementationOnce(
      () => new Promise((resolve) => { resolvePromise = resolve; })
    );

    const { result } = renderHook(() => useChat());

    act(() => {
      result.current.sendPrompt("Hello");
    });

    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      resolvePromise({ message: "Hi", conversationId: "abc" });
    });

    expect(result.current.isLoading).toBe(false);
  });

  it("persists conversationId in localStorage", () => {
    renderHook(() => useChat());

    const storedId = localStorage.getItem("conversationId");

    expect(storedId).not.toBeNull();
    expect(storedId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
    );
  });

  it("reuses existing conversationId from localStorage", () => {
    const existingId = "123e4567-e89b-12d3-a456-426614174000";
    localStorage.setItem("conversationId", existingId);

    renderHook(() => useChat());

    expect(localStorage.getItem("conversationId")).toBe(existingId);
  });
});
