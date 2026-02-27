// This file defines the types for the chat functionality in the client application.
// It includes types for messages, requests, and responses related to the chat feature.
export type MessageRole = "user" | "assistant";

export interface ChatMessage {
  role: MessageRole;
  content: string;
}

export interface SendMessageRequest {
  prompt: string;
  conversationId: string;
}

export interface SendMessageResponse {
  message: string;
  conversationId: string;
}
