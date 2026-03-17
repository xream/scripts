---
name: fetch-webpage
description: Fetch webpages into Markdown by URL, with a selectable --provider parameter for pure.md, defuddle.md, markdown.new, or r.jina.ai.
metadata: {"clawdbot":{"emoji":"📄","requires":{"bins":["node"]}}}
---

# Fetch Webpage

Fetch webpages and convert them to clean Markdown format using a selectable Markdown proxy provider.

## Usage

```bash
# Single URL, default provider is pure.md
node {baseDir}/scripts/fetch.mjs "https://example.com"

# Multiple URLs
node {baseDir}/scripts/fetch.mjs '["https://example.com", "https://example.org"]'

# With timeout
node {baseDir}/scripts/fetch.mjs "https://example.com" --timeout 60000

# Choose a specific provider
node {baseDir}/scripts/fetch.mjs "https://example.com" --provider defuddle.md
```

## Options

- `urls_json`: JSON array of URLs or a single URL string
- `--timeout <ms>`: Request timeout in milliseconds (default: 30000)
- `--provider <name>`: One of `pure.md`, `defuddle.md`, `markdown.new`, `r.jina.ai` (default: `pure.md`)

## Provider Selection

- If you already know a specific provider works better for this URL, domain, or content type, use that provider first
- Reuse the last successful provider for the same site within the current task when possible
- If there is no known preference, start with the default provider `pure.md`
- If the request fails or the Markdown quality is poor, retry the same URL with `--provider defuddle.md`
- If needed, retry again with `--provider markdown.new`
- Use `--provider r.jina.ai` as the last fallback
- Change only the `--provider` argument between retries unless you also need a longer `--timeout`

## Guidance For AI

- Do not mechanically start from `pure.md` if the task context already indicates another provider is more reliable for that target
- Prefer explicit provider choice over blind retry loops
- When reporting what you did, mention which provider was used, especially if you skipped the default based on prior knowledge or prior failures

Notes:
- Returns webpage content converted to Markdown
- This script does not auto-fallback; the caller selects the provider explicitly
- For multiple URLs, returns a JSON array of results and includes the selected `provider`
- Node.js 18+ required (native fetch)
