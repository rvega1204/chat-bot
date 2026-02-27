// @vitest-environment happy-dom
import { vi, describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChatInput } from "../components/ChatInput";

describe("ChatInput", () => {
  it("renders textarea and send button", () => {
    render(<ChatInput onSend={vi.fn()} isLoading={false} />);

    expect(screen.getByRole("textbox")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send/i })).toBeInTheDocument();
  });

  it("calls onSend with trimmed value on button click", async () => {
    const onSend = vi.fn();
    render(<ChatInput onSend={onSend} isLoading={false} />);

    await userEvent.type(screen.getByRole("textbox"), "  Hello world  ");
    await userEvent.click(screen.getByRole("button", { name: /send/i }));

    expect(onSend).toHaveBeenCalledWith("Hello world");
    expect(onSend).toHaveBeenCalledTimes(1);
  });

  it("calls onSend when Enter is pressed", async () => {
    const onSend = vi.fn();
    render(<ChatInput onSend={onSend} isLoading={false} />);

    await userEvent.type(screen.getByRole("textbox"), "Hello{Enter}");

    expect(onSend).toHaveBeenCalledWith("Hello");
  });

  it("does not call onSend when Shift+Enter is pressed", async () => {
    const onSend = vi.fn();
    render(<ChatInput onSend={onSend} isLoading={false} />);

    await userEvent.type(
      screen.getByRole("textbox"),
      "Hello{Shift>}{Enter}{/Shift}"
    );

    expect(onSend).not.toHaveBeenCalled();
  });

  it("clears input after sending", async () => {
    render(<ChatInput onSend={vi.fn()} isLoading={false} />);

    const input = screen.getByRole("textbox");
    await userEvent.type(input, "Hello{Enter}");

    expect(input).toHaveValue("");
  });

  it("disables textarea and button when loading", () => {
    render(<ChatInput onSend={vi.fn()} isLoading={true} />);

    expect(screen.getByRole("textbox")).toBeDisabled();
    expect(screen.getByRole("button", { name: /send/i })).toBeDisabled();
  });

  it("does not call onSend when input is empty", async () => {
    const onSend = vi.fn();
    render(<ChatInput onSend={onSend} isLoading={false} />);

    await userEvent.click(screen.getByRole("button", { name: /send/i }));

    expect(onSend).not.toHaveBeenCalled();
  });

  it("does not call onSend when loading even if input has value", async () => {
    const onSend = vi.fn();
    render(<ChatInput onSend={onSend} isLoading={true} />);

    await userEvent.click(screen.getByRole("button", { name: /send/i }));

    expect(onSend).not.toHaveBeenCalled();
  });
});
