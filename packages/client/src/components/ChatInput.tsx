import { promptSchema } from "@/schemas/chat.schema";
import { useState, type KeyboardEvent } from "react";

// Props for the ChatInput component, including the onSend callback and loading state.
interface Props {
  onSend: (prompt: string) => void;
  isLoading: boolean;
}

// The ChatInput component renders a textarea for the user to type their message and a send button.
// It handles the input state and calls the onSend callback when the user submits a message.
export function ChatInput({ onSend, isLoading }: Props) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSend() {
    const result = promptSchema.safeParse(value);

    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }

    setError(null);
    onSend(result.data);
    setValue("");
  }

  // Handle the Enter key to send the message, while allowing Shift + Enter for new lines.
  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="px-6 py-4 border-t border-border">
      <div className="flex items-end gap-3 bg-muted border border-input rounded-2xl px-4 py-3 focus-within:ring-1 focus-within:ring-ring transition-all">
        <textarea
          className="flex-1 resize-none bg-transparent text-foreground placeholder:text-muted-foreground placeholder:font-normal font-medium text-sm focus:outline-none leading-relaxed max-h-40"
          rows={1}
          placeholder="Message Llama..."
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          maxLength={1000}
        />
        <button
          className="bg-primary hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed text-primary-foreground rounded-xl px-4 py-2 text-sm font-medium transition-opacity shrink-0"
          onClick={handleSend}
          disabled={isLoading || !value.trim()}
        >
          Send
        </button>

        {error && <p className="text-xs text-destructive px-1">{error}</p>}
      </div>
      <div className="mt-3 flex flex-col items-center gap-1">
        <p className="mt-3 text-center text-muted-foreground/65 text-[11px] select-none">
          Llama 3.3 70B · © {new Date().getFullYear()} Ricardo Vega
        </p>
      </div>
    </div>
  );
}
