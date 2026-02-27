import { describe, it, expect, beforeEach } from "bun:test";
import { conversationRepository } from "../repositories/conversation.repository";

// Wipe all conversations before each test so shared global state
// doesn't bleed between tests.
beforeEach(() => conversationRepository.reset());

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("conversationRepository", () => {

  describe("getHistory", () => {
    it("returns undefined for a conversation that does not exist", () => {
      const result = conversationRepository.getHistory("non-existent-id");

      expect(result).toBeUndefined();
    });

    it("returns the history after it has been created", () => {
      const id = "123e4567-e89b-12d3-a456-426614174000";
      conversationRepository.getOrCreateHistory(id);

      const result = conversationRepository.getHistory(id);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it("returns the same array reference as the one used to push messages", () => {
      const id = "223e4567-e89b-12d3-a456-426614174001";
      const history = conversationRepository.getOrCreateHistory(id);
      history.push({ role: "user", content: "hello" });

      const result = conversationRepository.getHistory(id);

      expect(result).toHaveLength(1);
      expect(result?.[0]?.content).toBe("hello");
    });
  });

  describe("getOrCreateHistory", () => {
    it("initializes an empty array for a new conversationId", () => {
      const id = "333e4567-e89b-12d3-a456-426614174002";

      const history = conversationRepository.getOrCreateHistory(id);

      expect(history).toEqual([]);
    });

    it("returns the existing history without resetting it on subsequent calls", () => {
      const id = "444e4567-e89b-12d3-a456-426614174003";
      const history = conversationRepository.getOrCreateHistory(id);
      history.push({ role: "user", content: "first message" });

      const sameHistory = conversationRepository.getOrCreateHistory(id);

      expect(sameHistory).toHaveLength(1);
      expect(sameHistory[0]?.content).toBe("first message");
    });

    it("keeps conversations isolated from one another", () => {
      const idA = "555e4567-e89b-12d3-a456-426614174004";
      const idB = "666e4567-e89b-12d3-a456-426614174005";

      const historyA = conversationRepository.getOrCreateHistory(idA);
      historyA.push({ role: "user", content: "message in A" });

      const historyB = conversationRepository.getOrCreateHistory(idB);

      expect(historyB).toHaveLength(0);
    });
  });
});