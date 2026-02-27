import type { ChatMessage } from "../types/chat.types";

interface Props {
  message: ChatMessage;
}

export function MessageBubble({ message }: Props) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold mr-2 mt-1 shrink-0">
          AI
        </div>
      )}
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed text-foreground ${
          isUser
            ? "bg-secondary rounded-br-sm"
            : "bg-card border border-border rounded-bl-sm"
        }`}
      >
        {message.content}
      </div>
    </div>
  );
}