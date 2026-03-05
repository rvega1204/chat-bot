import { conversationRepository } from "../repositories/conversation.repository";
import Groq from "groq-sdk";

type ChatResponse = {
    /** Unique ID returned by the Groq API for this completion. */
    id: string;
    /** The assistant's reply text. */
    message: string;
};

let _client: Groq | null = null;

function getClient(): Groq {
  if (!_client) {
    _client = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  
  return _client;
}

export const chatService = {
  /**
   * Sends a user message to the LLM and returns the assistant's response.
   *
   * The full conversation history is retrieved (or created if this is the first
   * message), the new user prompt is appended, and the entire history is sent
   * to the model so it has context for multi-turn conversations.
   * The assistant's reply is then persisted back into the history.
   *
   * @param prompt - The user's message text.
   * @param conversationId - UUID identifying the conversation thread.
   * @returns An object containing the Groq completion ID and the assistant's reply.
   * @throws Will throw if the Groq API request fails.
   */
  async sendMessage(prompt: string, conversationId: string): Promise<ChatResponse> {
    // Ensures the conversation exists before operating on it.
    const history = conversationRepository.getOrCreateHistory(conversationId);

    history.push({ role: "user", content: prompt });

    const response = await getClient().chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.2,
      max_tokens: 2048,
      messages: history,
    });

    const content = response.choices[0]?.message?.content ?? "No response";

    // Persist the assistant reply so subsequent turns have full context.
    history.push({ role: "assistant", content });

    return {
        id: response.id,
        message: content,
    };
  }
};