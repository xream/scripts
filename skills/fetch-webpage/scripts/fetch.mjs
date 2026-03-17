#!/usr/bin/env node

const DEFAULT_TIMEOUT = 30000;
const DEFAULT_PROVIDER = "pure.md";
const DEFAULT_USER_AGENT = "Mozilla/5.0 (compatible; fetch-webpage-skill/1.0; +https://pure.md/)";
const MARKDOWN_PROVIDERS = {
  "pure.md": "https://pure.md/",
  "defuddle.md": "https://defuddle.md/",
  "markdown.new": "https://markdown.new/",
  "r.jina.ai": "https://r.jina.ai/",
};
const SUPPORTED_PROVIDERS = Object.keys(MARKDOWN_PROVIDERS);

function usage() {
  console.error(`Usage: fetch.mjs <urls_json> [--timeout 30000] [--provider pure.md]`);
  console.error(`  urls_json: JSON array of URLs or a single URL string`);
  console.error(`    e.g. '["https://example.com", "https://example.org"]'`);
  console.error(`  --provider <name>: one of ${SUPPORTED_PROVIDERS.join(", ")} (default: ${DEFAULT_PROVIDER})`);
  process.exit(2);
}

const args = process.argv.slice(2);
if (args.length === 0 || args[0] === "-h" || args[0] === "--help") usage();

let urls;
let timeout = DEFAULT_TIMEOUT;
let provider = DEFAULT_PROVIDER;

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
  if (a === "--provider" || a === "--service") {
    provider = args[i + 1] ?? DEFAULT_PROVIDER;
    i++;
    continue;
  }
  console.error(`Unknown arg: ${a}`);
  usage();
}

if (urls.length === 0) {
  console.error("At least one URL is required");
  process.exit(1);
}

if (!Object.hasOwn(MARKDOWN_PROVIDERS, provider)) {
  console.error(`Invalid provider: ${provider}`);
  console.error(`Supported providers: ${SUPPORTED_PROVIDERS.join(", ")}`);
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

async function fetchWebpage(url, providerName, timeoutMs) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  const fetchUrl = `${MARKDOWN_PROVIDERS[providerName]}${url}`;

  try {
    const resp = await fetch(fetchUrl, {
      headers: {
        "User-Agent": DEFAULT_USER_AGENT,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      signal: controller.signal,
    });

    if (!resp.ok) {
      throw new Error(`HTTP Error: ${resp.status} ${resp.statusText}`);
    }

    const body = await resp.text();
    if (!body.trim()) {
      throw new Error("Empty response body");
    }

    return body;
  } catch (err) {
    if (err.name === "AbortError") {
      throw new Error(`Request timed out after ${timeoutMs}ms via ${providerName}`);
    }

    throw new Error(`${providerName}: ${err.message}`);
  } finally {
    clearTimeout(timeoutId);
  }
}

try {
  const results = [];
  
  for (const url of urls) {
    console.error(`Fetching Markdown for: ${url} via ${provider}`);
    
    try {
      const data = await fetchWebpage(url, provider, timeout);
      console.error(`Fetched via ${provider}: ${url}`);
      results.push({
        url,
        success: true,
        provider,
        data,
      });
    } catch (err) {
      results.push({
        url,
        success: false,
        provider,
        error: err.message,
      });
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
