import { useEffect, useRef } from "react";
import { MessageBubble } from "./MessageBubble";
import type { ChatMessage } from "../types/chat.types";

interface Props {
  messages: ChatMessage[];
  isLoading: boolean;
}

// This component renders the list of chat messages and handles auto-scrolling to the latest message when new messages
// are added or when loading state changes.
// It also displays a placeholder message when there are no messages and a loading indicator when the AI is thinking.
export function MessageList({ messages, isLoading }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6">
      {messages.length === 0 && (
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground text-sm font-medium">
            How can I help you today?
          </p>
        </div>
      )}
      {messages.map((message, index) => (
        <MessageBubble key={index} message={message} />
      ))}
      {isLoading && (
        <div className="flex justify-start mb-3">
          <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold mr-2 mt-1 shrink-0">
            AI
          </div>
          <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-4 py-3 text-sm text-muted-foreground animate-pulse">
            Thinking...
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
