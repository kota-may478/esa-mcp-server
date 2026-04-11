#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createServer } from "./server.js";

const ESA_ACCESS_TOKEN = process.env.ESA_ACCESS_TOKEN;
const ESA_TEAM_NAME = process.env.ESA_TEAM_NAME;

if (!ESA_ACCESS_TOKEN || !ESA_TEAM_NAME) {
  console.error(
    "Error: ESA_ACCESS_TOKEN and ESA_TEAM_NAME environment variables are required."
  );
  process.exit(1);
}

const server = createServer(ESA_ACCESS_TOKEN, ESA_TEAM_NAME);
const transport = new StdioServerTransport();
await server.connect(transport);
console.error("esa MCP Server started.");
