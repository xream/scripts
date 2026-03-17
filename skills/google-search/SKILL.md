---
name: google-search
description: Use this tool when you need up-to-date information from the internet. It grounds the model with real-time Google Search results across languages, improving factual accuracy and enabling responses with verifiable citations beyond the model's knowledge cutoff.
metadata: {"clawdbot":{"emoji":"🔍","requires":{"bins":["node"]}}}
---

# Google Search

Web search using pure.md proxy to convert Google search pages to clean Markdown. No API key required.

## Search

```bash
node {baseDir}/scripts/search.mjs "query"
node {baseDir}/scripts/search.mjs "query" --timeout 60000
```

## Options

- `--timeout <ms>`: Request timeout in milliseconds (default: 30000)

Notes:
- Uses pure.md as proxy for clean Markdown output
- No API key required
- Supports multilingual searches
- Node.js 18+ required (native fetch)
