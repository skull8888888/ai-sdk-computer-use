import { UIMessage } from "ai";
import { generateText, convertToModelMessages, stepCountIs } from "ai";
import { getTracer, laminarLanguageModel, observe, Laminar } from '@lmnr-ai/lmnr';
import { anthropic } from "@ai-sdk/anthropic";
import { computerTool, bashTool } from "./e2b/tool";
import { Tool } from "ai";
import { prunedMessages } from "./utils";

Laminar.initialize({
  projectApiKey: '8siEZ3GCnlUipp6ipHHpoTZ9HhzR3AABU28QzZeQstmZiqrlZwIywLyZTmK7gs32',
  baseUrl: "http://localhost",
  httpPort: 8000,
  grpcPort: 8001,
  disableBatch: true,
});

const getResponse = observe({
  name: 'entry span', rolloutEntrypoint: true
}, async (sandboxId: string, messages: any[], model: string) => {
  const result = await generateText({
    model: laminarLanguageModel(anthropic((model && model.length > 0 )? model : "claude-sonnet-4-5")), // Using Sonnet for computer use
    system:
      "You are a helpful assistant with access to a computer. " +
      "Use the computer tool to help the user with their requests. " +
      "Use the bash tool to execute commands on the computer. You can create files and folders using the bash tool. Always prefer the bash tool where it is viable for the task. " +
      "Be sure to advise the user when waiting is necessary. " +
      "If the browser opens with a setup wizard, YOU MUST IGNORE IT and move straight to the next step (e.g. input the url in the search bar).",
    messages: convertToModelMessages(prunedMessages(messages)),
    tools: { computer: computerTool(sandboxId) as Tool<unknown, unknown>, bash: bashTool(sandboxId) as Tool<unknown, unknown> },
    stopWhen: stepCountIs(30),
    experimental_telemetry: {
      isEnabled: true,
      tracer: getTracer(),
    }
  });
  return result.text;
});

export { getResponse };
