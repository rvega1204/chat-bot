import { conversationRepository } from "../repositories/conversation.repository";
import Groq from "groq-sdk";

type ChatResponse = {
  /** Unique ID returned by the Groq API for this completion. */
  id: string;
  /** The assistant's reply text. */
  message: string;
};

let _client: Groq | null = null;
const MODEL_TOKEN_LIMIT = 12000;
const RESPONSE_TOKENS = 400;
const INPUT_TOKEN_BUDGET = MODEL_TOKEN_LIMIT - RESPONSE_TOKENS;

function estimateTokens(text: string) {
  return Math.ceil(text.length / 4);
}

function buildContext(messages: any[], maxTokens: number) {
  const selected = [];
  let tokens = 0;

  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    const messageTokens = estimateTokens(message.content);

    if (tokens + messageTokens > maxTokens) break;

    tokens += messageTokens;
    selected.unshift(message);
  }

  return selected;
}

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
  async sendMessage(
    prompt: string,
    conversationId: string,
  ): Promise<ChatResponse> {
    const history = conversationRepository.getOrCreateHistory(conversationId);

    if (prompt.length > 2000) {
      throw new Error("Prompt too large");
    }

    // add user message
    history.push({ role: "user", content: prompt });

    // ensure system prompt is always preserved
    const context = [
      history[0], // system message
      ...buildContext(history.slice(1), INPUT_TOKEN_BUDGET),
    ];

    const response = await getClient().chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.2,
      max_tokens: RESPONSE_TOKENS,
      messages: context,
    });

    const content = response.choices[0]?.message?.content ?? "No response";

    // store assistant reply
    history.push({ role: "assistant", content });

    // prevent memory growth
    if (history.length > 50) {
      history.splice(1, history.length - 50);
    }

    return {
      id: response.id,
      message: content,
    };
  },
};