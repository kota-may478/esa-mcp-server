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
  // ── Authentication ───────────────────────────────────────────────────────
  // Supports two methods so both Claude.ai and curl work:
  //
  //   1. Query parameter  ?token=<MCP_AUTH_TOKEN>
  //      → Used when registering the URL in Claude.ai's "Add connector" UI,
  //        e.g. https://xxx.vercel.app/api/mcp?token=<MCP_AUTH_TOKEN>
  //        Claude.ai has no field for custom headers, so the token must be
  //        embedded in the URL itself.
  //
  //   2. Authorization: Bearer <MCP_AUTH_TOKEN> header
  //      → Useful for curl-based testing and other HTTP clients.
  const expectedToken = process.env.MCP_AUTH_TOKEN;
  if (!expectedToken) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "MCP_AUTH_TOKEN is not configured" }));
    return;
  }

  const urlObj = new URL(req.url ?? "/", `https://${req.headers.host}`);
  const queryToken = urlObj.searchParams.get("token");
  const authHeader = req.headers.authorization;

  if (queryToken !== expectedToken && authHeader !== `Bearer ${expectedToken}`) {
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
  //
  // enableJsonResponse: true — respond with a direct JSON body instead of an
  // SSE stream. SSE keeps the connection open indefinitely, which causes
  // Vercel serverless functions to hang until the 10-second timeout.
  // JSON responses complete immediately and work correctly in serverless.
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined, // stateless — no session state between requests
    enableJsonResponse: true,
  });

  const server = createServer(esaToken, esaTeam);

  await server.connect(transport);
  // Pass req.body as parsedBody so the transport doesn't re-read the stream.
  // Do NOT call server.close() after this — closing the transport before the
  // response is flushed to the socket produces an empty response body.
  // In a serverless function the process is discarded after the handler
  // returns, so no explicit cleanup is needed.
  await transport.handleRequest(req, res, req.body);
}
