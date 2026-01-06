import { generateText } from "ai";
import { getTracer, laminarLanguageModel, observe, Laminar } from '@lmnr-ai/lmnr';
import { anthropic } from "@ai-sdk/anthropic";

Laminar.initialize({
  projectApiKey: '8siEZ3GCnlUipp6ipHHpoTZ9HhzR3AABU28QzZeQstmZiqrlZwIywLyZTmK7gs32',
  baseUrl: "http://localhost",
  httpPort: 8000,
  grpcPort: 8001,
  disableBatch: true,
});

const getResponse = observe({
  name: 'entry span', rolloutEntrypoint: true
}, async (userMessage: string, model: string) => {
  const result = await generateText({
    model: laminarLanguageModel(anthropic((model && model.length > 0 )? model : "claude-haiku-4-5")),
    system: "you must respond in CAPITAL LETTERS",
    messages: [{ role: "user", content: userMessage }],
    experimental_telemetry: {
      isEnabled: true,
      tracer: getTracer(),
    }
  });
  return result.text;
});

export { getResponse };
