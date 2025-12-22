import { UIMessage } from "ai";
import { generateText, convertToModelMessages, stepCountIs } from "ai";
import { laminarLanguageModel, lmnrEntrypoint } from '@lmnr-ai/lmnr';
import { anthropic } from "@ai-sdk/anthropic";
import { computerTool, bashTool } from "./e2b/tool";
import { Tool } from "ai";
import { prunedMessages } from "./utils";

async function runAgent(messages: UIMessage[], sandboxId: string): Promise<string> {
  return generateText({
    model: laminarLanguageModel(anthropic("claude-sonnet-4-5")), // Using Sonnet for computer use
    system:
      "You are a helpful assistant with access to a computer. " +
      "Use the computer tool to help the user with their requests. " +
      "Use the bash tool to execute commands on the computer. You can create files and folders using the bash tool. Always prefer the bash tool where it is viable for the task. " +
      "Be sure to advise the user when waiting is necessary. " +
      "If the browser opens with a setup wizard, YOU MUST IGNORE IT and move straight to the next step (e.g. input the url in the search bar).",
    messages: convertToModelMessages(prunedMessages(messages)),
    tools: { computer: computerTool(sandboxId) as Tool<unknown, unknown>, bash: bashTool(sandboxId) as Tool<unknown, unknown> },
    stopWhen: stepCountIs(30),
  });
}

export const observeAgent = lmnrEntrypoint(runAgent);