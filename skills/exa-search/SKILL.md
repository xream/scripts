---
name: exa-search
description: Use this tool when you need up-to-date web search results from Exa MCP. It calls `web_search_exa` over `text/event-stream`, supports optional `exaApiKey`, and returns extracted text content from search results.
metadata: {"openclaw":{"emoji":"🔎","requires":{"bins":["node"]}}}
---

# Exa Search

通过 Exa MCP (`https://mcp.exa.ai/mcp`) 执行 `web_search_exa`，并解析 `text/event-stream` 响应。

环境变量 `EXA_API_KEY` 可选, 可在 https://dashboard.exa.ai/api-keys 获取

## Usage

```bash
node {baseDir}/scripts/search.mjs "today is 2026-02-09
美国最新娱乐新闻"

node {baseDir}/scripts/search.mjs "美国最新娱乐新闻" --num-results 5 --type auto --livecrawl fallback

node {baseDir}/scripts/search.mjs "美国最新娱乐新闻" --exa-api-key YOUR_EXA_KEY

EXA_API_KEY=YOUR_EXA_KEY node {baseDir}/scripts/search.mjs "美国最新娱乐新闻"
```

## Options

- `--type <value>`: Exa 搜索类型，默认 `auto`
- `--num-results <number>`: 返回条数，默认 `5`
- `--livecrawl <value>`: 实时抓取策略，默认 `fallback`
- `--exa-api-key <key>`: 可选 API Key；传入后会自动拼接到 URL `?exaApiKey=...`
- `--endpoint <url>`: 可选 MCP endpoint，默认 `https://mcp.exa.ai/mcp`
- `--timeout <ms>`: 请求超时毫秒，默认 `30000`
- `--raw`: 输出原始 `text/event-stream`，不做解析

Notes:
- `https://mcp.exa.ai/mcp?exaApiKey=YOUR_EXA_KEY` 为可选写法
- 如果 `--endpoint` 已包含 `exaApiKey`，脚本不会重复追加
- 默认输出会提取 `event: message` 的 `data` JSON 中 `result.content[].text`
