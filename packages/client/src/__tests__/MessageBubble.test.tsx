// @vitest-environment happy-dom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MessageBubble } from "../components/MessageBubble";

describe("MessageBubble", () => {
  it("renders user message content", () => {
    render(<MessageBubble message={{ role: "user", content: "Hello!" }} />);

    expect(screen.getByText("Hello!")).toBeInTheDocument();
  });

  it("renders assistant message content", () => {
    render(<MessageBubble message={{ role: "assistant", content: "Hi there!" }} />);

    expect(screen.getByText("Hi there!")).toBeInTheDocument();
  });

  it("aligns user message to the right", () => {
    const { container } = render(
      <MessageBubble message={{ role: "user", content: "Hello!" }} />
    );

    expect(container.firstChild).toHaveClass("justify-end");
  });

  it("aligns assistant message to the left", () => {
    const { container } = render(
      <MessageBubble message={{ role: "assistant", content: "Hi!" }} />
    );

    expect(container.firstChild).toHaveClass("justify-start");
  });

  it("shows AI avatar only for assistant messages", () => {
    const { rerender } = render(
      <MessageBubble message={{ role: "assistant", content: "Hi" }} />
    );

    expect(screen.getByText("AI")).toBeInTheDocument();

    rerender(<MessageBubble message={{ role: "user", content: "Hi" }} />);

    expect(screen.queryByText("AI")).not.toBeInTheDocument();
  });
});
