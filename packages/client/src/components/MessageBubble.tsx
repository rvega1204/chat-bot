import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ChatMessage } from "../types/chat.types";

interface Props {
  message: ChatMessage;
}

export function MessageBubble({ message }: Props) {
  const isUser = message.role === "user";

  return (
    <div
      className={`message-bubble-wrapper ${
        isUser ? "message-bubble-wrapper--user" : "message-bubble-wrapper--ai"
      }`}
    >
      {!isUser && <div className="message-bubble-avatar">AI</div>}

      <div
        className={`message-bubble ${
          isUser ? "message-bubble--user" : "message-bubble--ai"
        }`}
      >
        {isUser ? (
          message.content
        ) : (
          <div className="message-bubble-content">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
