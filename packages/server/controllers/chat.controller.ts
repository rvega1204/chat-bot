import type { Request, Response } from "express";
import { chatService } from "../services/chat.service";
import z from "zod";

/**
 * Validation schema for incoming chat requests.
 * - `prompt`: non-empty string, max 1000 characters.
 * - `conversationId`: a valid UUID v4 that identifies the conversation thread.
 */
const chatRequestSchema = z.object({
  prompt: z
    .string()
    .trim()
    .min(1, "Prompt is required")
    .max(1000, "Prompt is too long"),
  conversationId: z.string().uuid("Invalid conversation ID format"),
});

export const chatController = {
  /**
   * Handles POST /api/chat requests.
   *
   * Validates the request body, delegates to `chatService.sendMessage`,
   * and returns the assistant's reply alongside the conversationId so the
   * client can reference the same thread in future requests.
   *
   * Responds with:
   * - 200 `{ message, conversationId }` on success.
   * - 400 `{ error }` if validation fails.
   * - 500 `{ error }` if an unexpected error occurs.
   */
    async sendMessage(req: Request, res: Response) {
        try {
            const parsed = chatRequestSchema.safeParse(req.body);

            if (!parsed.success) {
                return res.status(400).json({ error: parsed.error.format() });
            }

            const { prompt, conversationId } = parsed.data;

            const response = await chatService.sendMessage(prompt, conversationId);
            res.json({ message: response.message, conversationId });
        } catch (error) {
            console.error("Error processing chat request:", error);
            res.status(500).json({ error: "Error processing chat request" });
        }
    }
};