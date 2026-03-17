#!/usr/bin/env node

import UserAgent from "user-agents";

const DEFAULT_TIMEOUT = 30000;
const SEARCH_BASE_URL = "https://pure.md/https://www.google.com/search";

function usage() {
  console.error(`Usage: search.mjs "query" [--timeout 30000]`);
  process.exit(2);
}

const args = process.argv.slice(2);
if (args.length === 0 || args[0] === "-h" || args[0] === "--help") usage();

const query = args[0];
let timeout = DEFAULT_TIMEOUT;

for (let i = 1; i < args.length; i++) {
  const a = args[i];
  if (a === "--timeout") {
    timeout = Number.parseInt(args[i + 1] ?? String(DEFAULT_TIMEOUT), 10);
    i++;
    continue;
  }
  console.error(`Unknown arg: ${a}`);
  usage();
}

const trimmedQuery = query.trim();
if (trimmedQuery.length === 0) {
  console.error("Query cannot be empty");
  process.exit(1);
}

const searchUrl = `${SEARCH_BASE_URL}?q=${encodeURIComponent(trimmedQuery)}`;

const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), timeout);

try {
  const resp = await fetch(searchUrl, {
    headers: {
      "User-Agent": new UserAgent().toString(),
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
    signal: controller.signal,
  });

  if (!resp.ok) {
    throw new Error(`HTTP Error: ${resp.status} ${resp.statusText}`);
  }

  const data = await resp.text();
  console.log(data);
} catch (err) {
  if (err.name === "AbortError") {
    console.error(`Request timed out after ${timeout}ms`);
    process.exit(1);
  }
  console.error(`Error: ${err.message}`);
  process.exit(1);
} finally {
  clearTimeout(timeoutId);
}
