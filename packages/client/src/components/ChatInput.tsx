import { promptSchema } from "@/schemas/chat.schema";
import { useRef, useState, type KeyboardEvent } from "react";

interface Props {
  onSend: (prompt: string) => void;
  isLoading: boolean;
}

export function ChatInput({ onSend, isLoading }: Props) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function autoResize() {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }

  function handleChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    setValue(event.target.value);
    autoResize();
    if (error) setError(null);
  }

  function handleSend() {
    const result = promptSchema.safeParse(value);

    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }

    setError(null);
    onSend(result.data);
    setValue("");

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="chat-input-wrapper">
      {error && <p className="chat-input-error">{error}</p>}

      <div className="chat-input-box">
        <textarea
          ref={textareaRef}
          className="chat-input-textarea"
          rows={1}
          placeholder="Message Llama..."
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          maxLength={1000}
        />
        <button
          className="chat-input-send-btn"
          onClick={handleSend}
          disabled={isLoading || !value.trim()}
        >
          {isLoading ? (
            <span className="flex items-center gap-1.5">
              <span className="chat-input-spinner" />
              Sending
            </span>
          ) : (
            "Send"
          )}
        </button>
      </div>

      <p className="chat-input-footer">
        Llama 3.3 70B · © {new Date().getFullYear()} Ricardo Vega
      </p>
    </div>
  );
}