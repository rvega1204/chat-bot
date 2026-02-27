import { useState, useCallback, useRef } from "react";
import { sendMessage } from "../api/chat.api";
import type { ChatMessage } from "../types/chat.types";
import { useRateLimit } from "./useRateLimit";

// The getOrCreateConversationId function retrieves a conversation ID from localStorage or generates a new one if it doesn't exist.
// This ensures that the conversation context is preserved across page reloads for the same user session.
function getOrCreateConversationId(): string {
  const stored = localStorage.getItem("conversationId");
  if (stored) return stored;

  const newId = crypto.randomUUID();
  localStorage.setItem("conversationId", newId);
  return newId;
}

// The UseChatReturn interface defines the shape of the object returned by the useChat hook, including the conversation messages,
// loading state, error message, and the sendPrompt function for sending user messages to the backend.
interface UseChatReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  sendPrompt: (prompt: string) => Promise<void>;
}

// The useChat hook manages the state and logic for a chat interface, including the conversation history, loading state,
// and error handling.
// It provides a sendPrompt function that can be called to send a user's message to the backend and receive a response
// from the AI assistant.
export function useChat(): UseChatReturn {
  const conversationId = useRef<string>(getOrCreateConversationId());
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { checkLimit } = useRateLimit();

  const sendPrompt = useCallback(async (prompt: string) => {
    // Rate limit guard
    if (!checkLimit()) {
      setError("Too many messages. Please wait a moment.");
      return;
    }

    setError(null);
    setIsLoading(true);

    // Add the user's message to the conversation history immediately for a responsive UI experience.
    const userMessage: ChatMessage = { role: "user", content: prompt };
    setMessages((previous) => [...previous, userMessage]);

    // Send the message to the backend and handle the response or any errors that occur.
    try {
      const response = await sendMessage({
        prompt,
        conversationId: conversationId.current,
      });

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: response.message,
      };

      setMessages((previous) => [...previous, assistantMessage]);
    } catch (caught) {
      const message =
        caught instanceof Error ? caught.message : "Unexpected error";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [checkLimit]);

  return { messages, isLoading, error, sendPrompt };
}
