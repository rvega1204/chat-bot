/** Represents a single message in a conversation turn. */
type Message = { role: "user" | "assistant"; content: string };

/**
 * In-memory store for conversation histories.
 * Keyed by conversationId (UUID), each entry holds the full message history
 * in chronological order.
 *
 * NOTE: This store is ephemeral — all data is lost on server restart.
 * Replace with a persistent store (e.g. Redis, database) for production use.
 */
const conversations = new Map<string, Message[]>();

export const conversationRepository = {
    getHistory,
    getOrCreateHistory,
    /** Clears all conversations. Intended for use in tests only. */
    reset: () => conversations.clear(),
};

/**
 * Returns the message history for a given conversation.
 *
 * @param conversationId - UUID of the conversation to look up.
 * @returns The message array, or `undefined` if the conversation doesn't exist yet.
 */
function getHistory(conversationId: string): Message[] | undefined {
    return conversations.get(conversationId);
}

/**
 * Returns the message history for a given conversation.
 * If no history exists yet, initializes it with an empty array and returns that.
 *
 * @param conversationId - UUID of the conversation.
 * @returns The existing or newly created message array.
 */
function getOrCreateHistory(conversationId: string): Message[] {
    if (!conversations.has(conversationId)) {
        conversations.set(conversationId, []);
    }
    return conversations.get(conversationId)!;
}