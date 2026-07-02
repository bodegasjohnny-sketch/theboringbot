// Zero-dependency HTTP server: serves the static chat UI and a /api/chat endpoint.
// Runs on Node 22+ (native TypeScript). No build step, no npm install required for
// demo mode. Real Claude calls activate automatically when ANTHROPIC_API_KEY is set.

import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { respond, hasKey } from "./agent.ts";
import type { ChatMessage } from "./demoScript.ts";

const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "public");
const PORT = Number(process.env.PORT ?? 5173);

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
};

function send(res: any, code: number, body: string | Buffer, type = "text/plain") {
  res.writeHead(code, { "Content-Type": type });
  res.end(body);
}

async function readBody(req: any): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const c of req) chunks.push(c as Buffer);
  return Buffer.concat(chunks).toString("utf8");
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? "/", `http://${req.headers.host}`);

    if (req.method === "GET" && url.pathname === "/favicon.ico") {
      // Tiny transparent favicon so the browser doesn't log a 404.
      const png = Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
        "base64"
      );
      return send(res, 200, png, "image/png");
    }

    if (req.method === "GET" && url.pathname === "/api/health") {
      return send(res, 200, JSON.stringify({ ok: true, mode: hasKey() ? "live" : "demo" }),
        MIME[".json"]);
    }

    if (req.method === "POST" && url.pathname === "/api/chat") {
      const raw = await readBody(req);
      let messages: ChatMessage[] = [];
      try {
        const parsed = JSON.parse(raw || "{}");
        messages = Array.isArray(parsed.messages) ? parsed.messages : [];
      } catch {
        return send(res, 400, JSON.stringify({ error: "bad json" }), MIME[".json"]);
      }
      const out = await respond(messages);
      return send(res, 200, JSON.stringify(out), MIME[".json"]);
    }

    // Static files
    let pathname = url.pathname === "/" ? "/index.html" : url.pathname;
    const safe = normalize(pathname).replace(/^(\.\.[/\\])+/, "");
    const filePath = join(ROOT, safe);
    if (!filePath.startsWith(ROOT)) return send(res, 403, "forbidden");

    try {
      const data = await readFile(filePath);
      return send(res, 200, data, MIME[extname(filePath)] ?? "application/octet-stream");
    } catch {
      return send(res, 404, "not found");
    }
  } catch (err) {
    return send(res, 500, JSON.stringify({ error: String(err) }), MIME[".json"]);
  }
});

server.listen(PORT, () => {
  console.log(`AppBuilder web running at http://localhost:${PORT}  (${hasKey() ? "LIVE" : "DEMO"} mode)`);
});
