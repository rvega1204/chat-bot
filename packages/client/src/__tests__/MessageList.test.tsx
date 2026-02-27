// @vitest-environment happy-dom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MessageList } from "../components/MessageList";
import type { ChatMessage } from "../types/chat.types";

const messages: ChatMessage[] = [
  { role: "user", content: "Hello" },
  { role: "assistant", content: "Hi there!" },
];

describe("MessageList", () => {
  it("shows empty state when no messages", () => {
    render(<MessageList messages={[]} isLoading={false} />);

    expect(screen.getByText("How can I help you today?")).toBeInTheDocument();
  });

  it("hides empty state when there are messages", () => {
    render(<MessageList messages={messages} isLoading={false} />);

    expect(
      screen.queryByText("How can I help you today?")
    ).not.toBeInTheDocument();
  });

  it("renders all messages", () => {
    render(<MessageList messages={messages} isLoading={false} />);

    expect(screen.getByText("Hello")).toBeInTheDocument();
    expect(screen.getByText("Hi there!")).toBeInTheDocument();
  });

  it("shows thinking indicator when loading", () => {
    render(<MessageList messages={messages} isLoading={true} />);

    expect(screen.getByText("Thinking...")).toBeInTheDocument();
  });

  it("hides thinking indicator when not loading", () => {
    render(<MessageList messages={messages} isLoading={false} />);

    expect(screen.queryByText("Thinking...")).not.toBeInTheDocument();
  });

  it("renders correct number of message bubbles", () => {
    render(<MessageList messages={messages} isLoading={false} />);

    expect(screen.getByText("Hello")).toBeInTheDocument();
    expect(screen.getByText("Hi there!")).toBeInTheDocument();
  });
});
