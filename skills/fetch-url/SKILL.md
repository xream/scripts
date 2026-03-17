---
name: fetch-url
description: Use this when you need the raw HTTP response for non-HTML content or APIs. Examples: JSON, XML, RSS/Atom, CSV, plain text, files, or downloads. If the target is a human-readable web page (HTML) that should be converted to markdown, use fetch-webpage instead.
metadata: {"clawdbot":{"emoji":"🌐","requires":{"bins":["node"]}}}
---

# Fetch URL

Fetch raw HTTP responses from URLs. Supports multiple URLs and custom headers.

## Usage

```bash
# Single URL
node {baseDir}/scripts/fetch.mjs "https://api.example.com/data"

# Multiple URLs
node {baseDir}/scripts/fetch.mjs '["https://api.example.com/data1", "https://api.example.com/data2"]'

# With custom headers (per-URL)
node {baseDir}/scripts/fetch.mjs '["https://api.example.com/json", "https://api.example.com/text"]' '[{"accept":"application/json"}, {"accept":"text/plain"}]'

# With timeout
node {baseDir}/scripts/fetch.mjs "https://api.example.com/data" --timeout 60000
```

## Examples

### JSON API
```bash
# GitHub API - get repository info
node {baseDir}/scripts/fetch.mjs "https://api.github.com/repos/microsoft/vscode" '{"accept":"application/json","user-agent":"Mozilla/5.0"}'
```

### XML
```bash
# SOAP service or XML endpoint
node {baseDir}/scripts/fetch.mjs "https://api.example.com/soap" '{"accept":"application/xml"}'

# Sitemap
node {baseDir}/scripts/fetch.mjs "https://example.com/sitemap.xml"
```

### RSS / Atom Feed
```bash
# RSS 2.0 feed
node {baseDir}/scripts/fetch.mjs "https://example.com/rss.xml" '{"accept":"application/rss+xml"}'

# Atom feed
node {baseDir}/scripts/fetch.mjs "https://example.com/atom.xml" '{"accept":"application/atom+xml"}'
```

### CSV / Plain Text
```bash
# CSV data
node {baseDir}/scripts/fetch.mjs "https://example.com/data.csv" '{"accept":"text/csv"}'

# Plain text
node {baseDir}/scripts/fetch.mjs "https://example.com/robots.txt" '{"accept":"text/plain"}'
```

### Multiple Formats
```bash
# Fetch JSON and XML in parallel
node {baseDir}/scripts/fetch.mjs '["https://api.example.com/data.json", "https://api.example.com/data.xml"]' '[{"accept":"application/json"}, {"accept":"application/xml"}]'
```

## Options

- `urls_json`: JSON array of URLs or a single URL string
- `headers_json`: Optional JSON array of headers objects (same length as urls)
- `--timeout <ms>`: Request timeout in milliseconds (default: 30000)

Notes:
- Returns raw HTTP response body
- For multiple URLs, returns JSON array of results
- Node.js 18+ required (native fetch)