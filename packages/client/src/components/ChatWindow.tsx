import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useChat } from "../hooks/useChat";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";

export function ChatWindow() {
  const { messages, isLoading, error, sendPrompt } = useChat();

  return (
    <div className="flex flex-col h-screen w-full max-w-3xl mx-auto bg-background">
      <header className="px-4 md:px-6 py-3 md:py-4 border-b border-border flex items-center justify-between">
        <div>
          <span className="text-foreground font-semibold text-sm">Chat</span>
          <span className="text-muted-foreground font-medium text-sm">
            {" "}
            — Llama 3.3 70B
          </span>
        </div>

        <Sheet>
          <SheetTrigger className="text-primary hover:text-primary/80 transition-colors text-lg select-none">
            ⓘ
          </SheetTrigger>
          <SheetContent className="bg-background border-border px-6 flex flex-col">
            <SheetHeader className="pb-4 border-b border-border shrink-0">
              <SheetTitle className="text-foreground text-base">
                About this project
              </SheetTitle>
            </SheetHeader>

            <div className="mt-6 flex flex-col gap-6 text-sm flex-1 overflow-y-auto pb-4">
              <div className="flex flex-col gap-2">
                <p className="text-foreground font-semibold text-xs uppercase tracking-widest text-muted-foreground">
                  Overview
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Stateful multi-turn chat powered by Llama 3.3 70B via Groq.
                  Conversations are kept in memory across multiple turns in the
                  same session.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <p className="text-foreground font-semibold text-xs uppercase tracking-widest text-muted-foreground">
                  Tech Stack
                </p>
                <ul className="flex flex-col gap-2">
                  {[
                    ["Runtime", "Bun"],
                    ["Server", "Express 5 + TypeScript"],
                    ["Client", "React 19 + Vite"],
                    ["LLM", "Groq / Llama 3.3 70B"],
                    ["Validation", "Zod 4"],
                  ].map(([label, value]) => (
                    <li key={label} className="flex justify-between">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="text-foreground font-medium">
                        {value}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col gap-2">
                <p className="text-foreground font-semibold text-xs uppercase tracking-widest text-muted-foreground">
                  Architecture
                </p>
                <p className="font-mono text-xs bg-muted text-muted-foreground px-4 py-3 rounded-xl leading-relaxed">
                  Request → Router → Controller
                  <br />→ Service → Repository
                </p>
              </div>

              <div className="flex flex-col gap-2 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-widest text-destructive/70">
                  Disclaimer
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  This is a{" "}
                  <span className="text-foreground font-medium">
                    demonstration project
                  </span>{" "}
                  built for educational purposes. AI-generated responses may
                  occasionally be inaccurate or incomplete. Token and prompt
                  size validations have been implemented to ensure system
                  stability and prevent excessive requests. Please verify
                  critical information and avoid sharing personal or sensitive
                  data.
                </p>
              </div>

              <div className="pt-4 border-t border-border shrink-0">
                <p className="text-xs text-muted-foreground/50 text-center">
                  © {new Date().getFullYear()} Ricardo Vega · All rights
                  reserved
                </p>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </header>

      <MessageList messages={messages} isLoading={isLoading} />

      {error && (
        <p className="text-destructive text-xs text-center px-4 pb-1">
          {error}
        </p>
      )}

      <ChatInput onSend={sendPrompt} isLoading={isLoading} />
    </div>
  );
}
