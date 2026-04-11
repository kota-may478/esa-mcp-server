import type { IncomingMessage, ServerResponse } from "node:http";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createServer } from "../src/server.js";

// Vercel body parser is enabled by default.
// We pass req.body (already parsed) as parsedBody to the transport,
// so the transport does not try to re-read the consumed request stream.
export const config = {
  api: {
    bodyParser: true,
  },
};

interface RequestWithBody extends IncomingMessage {
  body?: unknown;
}

export default async function handler(
  req: RequestWithBody,
  res: ServerResponse
): Promise<void> {
  // ── Bearer token authentication ──────────────────────────────────────────
  const expectedToken = process.env.MCP_AUTH_TOKEN;
  if (!expectedToken) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "MCP_AUTH_TOKEN is not configured" }));
    return;
  }

  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${expectedToken}`) {
    res.writeHead(401, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Unauthorized" }));
    return;
  }

  // ── Environment variable check ───────────────────────────────────────────
  const esaToken = process.env.ESA_ACCESS_TOKEN;
  const esaTeam = process.env.ESA_TEAM_NAME;
  if (!esaToken || !esaTeam) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "ESA environment variables are not configured" }));
    return;
  }

  // ── MCP Streamable HTTP (stateless mode) ─────────────────────────────────
  // A new server + transport instance is created per request.
  // This is the correct pattern for stateless serverless environments.
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined, // stateless — no session state between requests
  });

  const server = createServer(esaToken, esaTeam);

  try {
    await server.connect(transport);
    // Pass req.body as parsedBody so the transport doesn't re-read the stream
    await transport.handleRequest(req, res, req.body);
  } finally {
    await server.close();
  }
}
