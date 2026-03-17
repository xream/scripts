---
name: ollama-web
description: Use Ollama Cloud web APIs for single-query web search and single-page web fetch. Requires OLLAMA_API_KEY and uses shell HTTP requests, preferably curl.
metadata: { "openclaw": { "requires": { "env": ["OLLAMA_API_KEY"] }, "primaryEnv": "OLLAMA_API_KEY", "emoji": "🦙" } }
---

# Ollama Web

Call Ollama Cloud's `web_search` and `web_fetch` APIs from the shell. This skill intentionally does not use a `scripts/` directory.

## When to use

- User asks for Ollama web search or web fetch
- User wants to search the web through Ollama Cloud
- User wants to fetch a single webpage through Ollama Cloud and extract structured content

## Required environment variable

`OLLAMA_API_KEY` must be set before sending requests.

```bash
export OLLAMA_API_KEY=your_api_key_here
test -n "$OLLAMA_API_KEY" || { echo "OLLAMA_API_KEY is required" >&2; exit 1; }
```

## HTTP client policy

- Prefer `curl`
- Do not create a dedicated script just for this skill
- Do not install new dependencies just to make the request
- If `curl` is unavailable, use any HTTP client already present in the environment and preserve the same method, URL, headers, and JSON body
- If no HTTP-capable tool is available, stop and report the exact request specification instead of fabricating results

Check for `curl` like this:

```bash
command -v curl >/dev/null 2>&1 || echo "curl not found"
```

## Web Search

Performs a web search for a single query and returns relevant results.

### Request

- Method: `POST`
- URL: `https://ollama.com/api/web_search`
- Headers:
  - `Authorization: Bearer $OLLAMA_API_KEY`
  - `Content-Type: application/json`
- JSON body:
  - `query` (string, required)
  - `max_results` (integer, optional, default `5`, max `10`)

### `curl` example

```bash
curl --request POST \
  --url https://ollama.com/api/web_search \
  --header "Authorization: Bearer $OLLAMA_API_KEY" \
  --header 'Content-Type: application/json' \
  --data '{
    "query": "what is ollama?",
    "max_results": 5
  }'
```

### Response shape

```json
{
  "results": [
    {
      "title": "Ollama",
      "url": "https://ollama.com/",
      "content": "Cloud models are now available..."
    }
  ]
}
```

### Guidance

- `query` is a single search string, not a list
- Omit `max_results` unless a non-default value is needed
- Never send `max_results` greater than `10`
- Report only what the API returned; do not invent missing search results

## Web Fetch

Fetches a single web page by URL and returns its content.

### Request

- Method: `POST`
- URL: `https://ollama.com/api/web_fetch`
- Headers:
  - `Authorization: Bearer $OLLAMA_API_KEY`
  - `Content-Type: application/json`
- JSON body:
  - `url` (string, required)

### `curl` example

```bash
curl --request POST \
  --url https://ollama.com/api/web_fetch \
  --header "Authorization: Bearer $OLLAMA_API_KEY" \
  --header 'Content-Type: application/json' \
  --data '{
    "url": "https://ollama.com"
  }'
```

### Response shape

```json
{
  "title": "Ollama",
  "content": "[Cloud models](https://ollama.com/blog/cloud-models) are now available in Ollama...",
  "links": [
    "http://ollama.com/",
    "http://ollama.com/models",
    "https://github.com/ollama/ollama"
  ]
}
```

### Guidance

- Send exactly one URL per request
- Prefer absolute URLs such as `https://ollama.com`
- Report only the returned `title`, `content`, and `links`; do not summarize as if the full page was fetched unless the API returned it

## Fallback behavior when `curl` is missing

If `curl` is not available, keep the request contract identical and use another installed client. The contract is:

- Method: `POST`
- URL: `https://ollama.com/api/web_search` or `https://ollama.com/api/web_fetch`
- Header: `Authorization: Bearer $OLLAMA_API_KEY`
- Header: `Content-Type: application/json`
- Body for search: `{"query":"...","max_results":5}`
- Body for fetch: `{"url":"https://example.com"}`

If no client can send the request, surface the request contract above and stop. That is better than guessing or claiming the API was called when it was not.
