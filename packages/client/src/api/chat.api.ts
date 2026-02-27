import type {
  SendMessageRequest,
  SendMessageResponse,
} from "../types/chat.types";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

// The sendMessage function sends a POST request to the /api/chat endpoint with the user's message payload.
// It handles the response and errors, returning the AI's response or throwing an error if the request fails.
export async function sendMessage(
  payload: SendMessageRequest,
): Promise<SendMessageResponse> {
  try {
    const response = await fetch(`${BASE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message ?? `HTTP error ${response.status}`);
    }

    return response.json() as Promise<SendMessageResponse>;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error instanceof Error ? error : new Error("Unknown error");
  }
}
