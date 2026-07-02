// Agent dispatcher: real Claude Agent SDK path when ANTHROPIC_API_KEY is present,
// scripted demo path otherwise. The demo path is what runs (and is tested) in an
// environment with no key; the real path is what powers the deployed product.

import { SYSTEM_PROMPT } from "./systemPrompt.ts";
import { demoRespond, type ChatMessage, type AgentReply } from "./demoScript.ts";

const MODEL = "claude-sonnet-5"; // cost-efficient, near-Opus copy quality

export function hasKey(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

// The render_preview tool the model calls to update the live preview iframe.
const RENDER_PREVIEW_TOOL = {
  name: "render_preview",
  description:
    "Render a complete, self-contained HTML document in the user's live preview pane. " +
    "Call this whenever you produce or update the built app.",
  input_schema: {
    type: "object" as const,
    properties: {
      html: { type: "string", description: "A full, self-contained HTML document." },
    },
    required: ["html"],
    additionalProperties: false,
  },
};

export async function respond(messages: ChatMessage[]): Promise<AgentReply> {
  if (!hasKey()) return demoRespond(messages);

  // Real path — dynamically imported so the app runs in demo mode without the SDK installed.
  let Anthropic: any;
  try {
    ({ default: Anthropic } = await import("@anthropic-ai/sdk"));
  } catch {
    return {
      reply:
        "A key is set but @anthropic-ai/sdk isn't installed. Run `npm install @anthropic-ai/sdk`, " +
        "or unset ANTHROPIC_API_KEY to use demo mode.",
    };
  }

  const client = new Anthropic();
  let preview: string | undefined;
  let text = "";
  const convo: any[] = messages.map((m) => ({ role: m.role, content: m.content }));

  // Minimal agent loop: run tools (render_preview) until the model stops calling them.
  for (let i = 0; i < 6; i++) {
    const res = await client.messages.create({
      model: MODEL,
      max_tokens: 8000,
      system: SYSTEM_PROMPT,
      tools: [RENDER_PREVIEW_TOOL],
      messages: convo,
    });

    for (const block of res.content) {
      if (block.type === "text") text += block.text;
    }

    const toolUses = res.content.filter((b: any) => b.type === "tool_use");
    if (res.stop_reason !== "tool_use" || toolUses.length === 0) break;

    convo.push({ role: "assistant", content: res.content });
    const results: any[] = [];
    for (const tu of toolUses) {
      if (tu.name === "render_preview") preview = String(tu.input?.html ?? "");
      results.push({ type: "tool_result", tool_use_id: tu.id, content: "rendered" });
    }
    convo.push({ role: "user", content: results });
  }

  return { reply: text.trim() || "(no text response)", preview };
}
