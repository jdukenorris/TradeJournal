# Playwright Render Service

Minimal render service for Mode B. Captures screenshots from a view-only TradingView layout.

## Run locally

```
npm i express playwright
PLAYWRIGHT_SERVICE_TOKEN=dev node server.js
```

- POST /render with JSON `{ layoutUrl, symbol, tfs: ['1h','5m'], zoomProfile }`
- GET /health returns `{ ok: true }`

This service should be deployed separately and protected with network rules and bearer token.

