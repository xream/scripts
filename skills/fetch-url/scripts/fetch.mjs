#!/usr/bin/env node

import UserAgent from "user-agents";

const DEFAULT_TIMEOUT = 30000;

function usage() {
  console.error(`Usage: fetch.mjs <urls_json> [headers_json] [--timeout 30000]`);
  console.error(`  urls_json: JSON array of URLs, e.g. '["https://api.example.com/data"]'`);
  console.error(`  headers_json: Optional JSON array of headers objects (same length as urls)`);
  console.error(`    e.g. '[{"accept":"application/json"}, {"accept":"text/plain"}]'`);
  process.exit(2);
}

const args = process.argv.slice(2);
if (args.length === 0 || args[0] === "-h" || args[0] === "--help") usage();

let urls;
let headers = [];
let timeout = DEFAULT_TIMEOUT;

// Parse URLs (first argument)
try {
  urls = JSON.parse(args[0]);
  if (!Array.isArray(urls)) {
    urls = [urls];
  }
} catch {
  // Treat as single URL string
  urls = [args[0]];
}

// Parse remaining arguments
for (let i = 1; i < args.length; i++) {
  const a = args[i];
  if (a === "--timeout") {
    timeout = Number.parseInt(args[i + 1] ?? String(DEFAULT_TIMEOUT), 10);
    i++;
    continue;
  }
  // Try to parse as headers JSON
  if (!headers.length) {
    try {
      const parsed = JSON.parse(a);
      if (Array.isArray(parsed)) {
        headers = parsed;
        continue;
      }
    } catch {
      // Not valid JSON, ignore
    }
  }
  console.error(`Unknown arg: ${a}`);
  usage();
}

if (urls.length === 0) {
  console.error("At least one URL is required");
  process.exit(1);
}

// Validate URLs
for (const url of urls) {
  try {
    new URL(url);
  } catch {
    console.error(`Invalid URL: ${url}`);
    process.exit(1);
  }
}

async function fetchUrl(url, customHeaders = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const resp = await fetch(url, {
      headers: {
        "User-Agent": new UserAgent().toString(),
        ...customHeaders,
      },
      signal: controller.signal,
    });

    if (!resp.ok) {
      throw new Error(`HTTP Error: ${resp.status} ${resp.statusText}`);
    }

    return await resp.text();
  } finally {
    clearTimeout(timeoutId);
  }
}

try {
  const results = [];
  
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    const customHeaders = headers[i] || {};
    
    console.error(`Fetching: ${url}`);
    
    try {
      const data = await fetchUrl(url, customHeaders);
      results.push({
        url,
        success: true,
        data,
      });
    } catch (err) {
      if (err.name === "AbortError") {
        results.push({
          url,
          success: false,
          error: `Request timed out after ${timeout}ms`,
        });
      } else {
        results.push({
          url,
          success: false,
          error: err.message,
        });
      }
    }
  }

  // Output results
  if (results.length === 1) {
    const r = results[0];
    if (r.success) {
      console.log(r.data);
    } else {
      console.error(`Error: ${r.error}`);
      process.exit(1);
    }
  } else {
    // Multiple URLs - output as JSON
    console.log(JSON.stringify(results, null, 2));
  }
} catch (err) {
  console.error(`Error: ${err.message}`);
  process.exit(1);
}
