import { generateText, UIMessage } from "ai";
import { killDesktop } from "@/lib/e2b/utils";
// import { getTracer, laminarLanguageModel, observeRollout } from "@lmnr-ai/lmnr";
// import { anthropic } from "@ai-sdk/anthropic";
// import { prunedMessages } from "@/lib/utils";
// import { computerTool, bashTool } from "@/lib/e2b/tool";
// import { Tool } from "ai";
// import { convertToModelMessages, stepCountIs } from "ai";
import { getResponse } from "@/lib/agent";

// Allow streaming responses up to 30 seconds
export const maxDuration = 300;

export async function POST(req: Request) {
  const { messages, sandboxId }: { messages: UIMessage[]; sandboxId: string } =
    await req.json();
  try {

    const result: string = await getResponse(sandboxId, messages);

    return new Response(result, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

    // Create response stream with UI message format for useCha
  } catch (error) {
    console.error("Chat API error:", error);
    await killDesktop(sandboxId); // Force cleanup on error
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
