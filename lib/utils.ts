import { UIMessage } from "ai";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const ABORTED = "User aborted";

export const prunedMessages = (messages: UIMessage[]): UIMessage[] => {
  if (messages.at(-1)?.role === "assistant") {
    return messages;
  }

  return messages.map((message) => {
    // check if last message part is a tool invocation with screenshot action, then redact the result
    message.parts = message.parts.map((part) => {
      if (part.type === "tool-computer" && "input" in part) {
        if (
          part.input &&
          typeof part.input === "object" &&
          "action" in part.input &&
          part.input.action === "screenshot" &&
          part.state === "output-available"
        ) {
          return {
            ...part,
            output: {
              type: "text",
              text: "Image redacted to save input tokens",
            },
          };
        }
        return part;
      }
      return part;
    });
    return message;
  });
};
