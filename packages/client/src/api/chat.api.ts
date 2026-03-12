import type {
  SendMessageRequest,
  SendMessageResponse,
} from "../types/chat.types";
import { apiFetch } from "./api-fetch";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export async function sendMessage(
  payload: SendMessageRequest,
): Promise<SendMessageResponse> {
  return apiFetch<SendMessageResponse>(`${BASE_URL}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
}
