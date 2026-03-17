#!/usr/bin/env node

const DEFAULT_TIMEOUT = 30000;
const DEFAULT_ENDPOINT = "https://mcp.exa.ai/mcp";
const DEFAULT_TYPE = "auto";
const DEFAULT_NUM_RESULTS = 5;
const DEFAULT_LIVECRAWL = "fallback";

const FIXED_HEADERS = {
  "sec-ch-ua-platform": "\"macOS\"",
  "sec-ch-ua": "\"Not=A?Brand\";v=\"24\", \"Chromium\";v=\"140\"",
  "sec-ch-ua-mobile": "?0",
  "x-title": "Cherry Studio",
  "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) CherryStudio/1.7.17 Chrome/140.0.7339.249 Electron/38.7.0 Safari/537.36",
  "accept": "application/json, text/event-stream",
  "http-referer": "https://cherry-ai.com",
  "content-type": "application/json",
  "sec-fetch-site": "cross-site",
  "sec-fetch-mode": "cors",
  "sec-fetch-dest": "empty",
  "accept-encoding": "gzip, deflate, br, zstd",
  "accept-language": "zh-CN",
  "priority": "u=1, i",
};

function usage() {
  console.error(`Usage: search.mjs "query" [options]`);
  console.error(`Options:`);
  console.error(`  --type <value>          Search type (default: ${DEFAULT_TYPE})`);
  console.error(`  --num-results <number>  Number of results (default: ${DEFAULT_NUM_RESULTS})`);
  console.error(`  --livecrawl <value>     livecrawl mode (default: ${DEFAULT_LIVECRAWL})`);
  console.error(`  --exa-api-key <key>     Optional Exa API key`);
  console.error(`  --endpoint <url>        MCP endpoint (default: ${DEFAULT_ENDPOINT})`);
  console.error(`  --timeout <ms>          Request timeout (default: ${DEFAULT_TIMEOUT})`);
  console.error(`  --raw                   Print raw text/event-stream response`);
  process.exit(2);
}

function appendExaApiKey(endpoint, exaApiKey) {
  if (!exaApiKey) return endpoint;
  const url = new URL(endpoint);
  if (!url.searchParams.has("exaApiKey")) {
    url.searchParams.set("exaApiKey", exaApiKey);
  }
  return url.toString();
}

function parseSsePayload(rawBody) {
  const events = [];
  const blocks = rawBody.split(/\r?\n\r?\n/);

  for (const block of blocks) {
    if (!block.trim()) continue;
    const lines = block.split(/\r?\n/);
    let eventType = "message";
    const dataLines = [];

    for (const line of lines) {
      if (!line || line.startsWith(":")) continue;
      const idx = line.indexOf(":");
      const field = idx === -1 ? line : line.slice(0, idx);
      const value = idx === -1 ? "" : line.slice(idx + 1).replace(/^ /, "");

      if (field === "event") eventType = value;
      if (field === "data") dataLines.push(value);
    }

    if (dataLines.length) {
      events.push({ event: eventType, data: dataLines.join("\n") });
    }
  }

  return events;
}

function extractTextFromPayload(payload) {
  const content = payload?.result?.content;
  if (!Array.isArray(content)) return [];
  return content
    .filter((item) => item?.type === "text" && typeof item.text === "string")
    .map((item) => item.text.trim())
    .filter(Boolean);
}

const args = process.argv.slice(2);
if (args.length === 0 || args[0] === "-h" || args[0] === "--help") usage();

const query = (args[0] ?? "").trim();
if (!query) {
  console.error("Query cannot be empty");
  process.exit(1);
}

let type = DEFAULT_TYPE;
let numResults = DEFAULT_NUM_RESULTS;
let livecrawl = DEFAULT_LIVECRAWL;
let timeout = DEFAULT_TIMEOUT;
let exaApiKey = process.env.EXA_API_KEY ?? "";
let endpoint = DEFAULT_ENDPOINT;
let raw = false;

for (let i = 1; i < args.length; i++) {
  const arg = args[i];
  if (arg === "--type") {
    type = args[++i] ?? DEFAULT_TYPE;
    continue;
  }
  if (arg === "--num-results") {
    numResults = Number.parseInt(args[++i] ?? String(DEFAULT_NUM_RESULTS), 10);
    continue;
  }
  if (arg === "--livecrawl") {
    livecrawl = args[++i] ?? DEFAULT_LIVECRAWL;
    continue;
  }
  if (arg === "--timeout") {
    timeout = Number.parseInt(args[++i] ?? String(DEFAULT_TIMEOUT), 10);
    continue;
  }
  if (arg === "--exa-api-key") {
    exaApiKey = args[++i] ?? "";
    continue;
  }
  if (arg === "--endpoint") {
    endpoint = args[++i] ?? DEFAULT_ENDPOINT;
    continue;
  }
  if (arg === "--raw") {
    raw = true;
    continue;
  }

  console.error(`Unknown arg: ${arg}`);
  usage();
}

if (!Number.isFinite(numResults) || numResults <= 0) {
  console.error("--num-results must be a positive integer");
  process.exit(1);
}

if (!Number.isFinite(timeout) || timeout <= 0) {
  console.error("--timeout must be a positive integer");
  process.exit(1);
}

let requestUrl;
try {
  requestUrl = appendExaApiKey(endpoint, exaApiKey);
} catch {
  console.error(`Invalid endpoint URL: ${endpoint}`);
  process.exit(1);
}

const finalQuery = `today is ${new Date().toISOString().split('T')[0]} \r\n ${query}`;

const body = {
  jsonrpc: "2.0",
  id: 1,
  method: "tools/call",
  params: {
    name: "web_search_exa",
    arguments: {
      query: finalQuery,
      type,
      numResults,
      livecrawl,
    },
  },
};

const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), timeout);

try {
  const resp = await fetch(requestUrl, {
    method: "POST",
    headers: FIXED_HEADERS,
    body: JSON.stringify(body),
    signal: controller.signal,
  });

  const textBody = await resp.text();
  if (!resp.ok) {
    throw new Error(`HTTP Error: ${resp.status} ${resp.statusText}\n${textBody}`);
  }

  if (raw) {
    console.log(textBody);
    process.exit(0);
  }

  const events = parseSsePayload(textBody);
  if (events.length === 0) {
    const parsedJson = JSON.parse(textBody);
    const texts = extractTextFromPayload(parsedJson);
    if (texts.length) {
      console.log(texts.join("\n\n"));
      process.exit(0);
    }
    console.log(textBody);
    process.exit(0);
  }

  const texts = [];
  for (const evt of events) {
    if (evt.data === "[DONE]") continue;
    try {
      const payload = JSON.parse(evt.data);
      texts.push(...extractTextFromPayload(payload));
    } catch {
      // Ignore non-JSON chunks
    }
  }

  if (texts.length) {
    console.log(texts.join("\n\n"));
  } else {
    console.log(textBody);
  }
} catch (err) {
  if (err.name === "AbortError") {
    console.error(`Request timed out after ${timeout}ms`);
  } else {
    console.error(`Error: ${err.message}`);
  }
  process.exit(1);
} finally {
  clearTimeout(timeoutId);
}
