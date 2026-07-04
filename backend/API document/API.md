# Tax-Payers Backend API Reference

## Overview

The Tax-Payers backend is a JSON REST API for a public government-spending
transparency platform. It exposes read-only data about geographic **areas**
and the infrastructure **projects** within them, aggregate **spending
stats**, and a **chat** endpoint that proxies a single conversational turn
to an AI provider chosen (and keyed) by the caller.

- **Base URL**: `http://localhost:5000/api` by default.
  - The port is configurable via the `PORT` environment variable (`.env`,
    default `5000`).
  - All routes below are relative to this base URL, i.e. `/health` means
    `http://localhost:5000/api/health`.
- **Format**: All requests and responses use `application/json`.
- **Authentication**: None. There is no login, session, or API-key
  mechanism for calling this backend itself. The one exception is the
  `/chat` endpoint, which is "bring-your-own-key" for the *third-party AI
  provider* — see the [Chat endpoint](#post-chat) section below.
- **CORS**: Restricted to the origin configured via `CORS_ORIGIN` in
  `.env` (defaults to `http://localhost:5173`, the Vite dev server).

---

## Table of contents

- [Error format](#error-format)
- [`GET /health`](#get-health)
- [`GET /areas`](#get-areas)
- [`GET /areas/:id`](#get-areasid)
- [`GET /projects`](#get-projects)
- [`GET /projects/:id`](#get-projectsid)
- [`GET /stats`](#get-stats)
- [`GET /providers`](#get-providers)
- [`POST /chat`](#post-chat)

---

## Error format

All error responses (validation failures, not-found, upstream/provider
failures, and unhandled server errors) share a single JSON shape, produced
by the centralized error handler (`src/middleware/errorHandler.js`):

```json
{
  "error": {
    "message": "Human-readable description of what went wrong"
  }
}
```

When the error originates from request validation (`src/middleware/validate.js`),
an additional `details` array is included, with one entry per failed field:

```json
{
  "error": {
    "message": "Invalid request parameters",
    "details": [
      { "field": "type", "message": "Invalid value" }
    ]
  }
}
```

### Status codes used across the API

| Status | Meaning | Where it comes from |
|---|---|---|
| `400` | Request failed validation (bad/missing query, param, or body field) | `validate.js` middleware, or a provider config error (e.g. missing required API key, unsupported provider) in `chat.service.js` |
| `401` | The upstream AI provider rejected the supplied API key | `providers/errorUtils.js` maps provider `401`/`403` to `401` |
| `404` | The requested area/project/route does not exist | Controllers (area/project lookups), `notFoundHandler` for unmatched routes |
| `429` | The upstream AI provider rate-limited the request | `providers/errorUtils.js` maps provider `429` straight through |
| `502` | The backend could not reach, or got an unexpected response from, an upstream AI provider | Provider adapters (`anthropic.js`, `openaiCompat.js`, `ollama.js`) |
| `503` | A local Ollama instance is not running/reachable | `ollama.js` (connection refused) |
| `500` | Unhandled server error | `errorHandler.js` default; in production the message is generic (`Internal server error`) rather than the raw error message |

Unmatched routes (any path not defined below) return a `404` from the
generic not-found handler:

```json
{
  "error": {
    "message": "Route GET /api/does-not-exist not found"
  }
}
```

---

## `GET /health`

Simple liveness check. No params.

**Example request**

```bash
curl http://localhost:5000/api/health
```

**Example response — `200 OK`**

```json
{
  "status": "ok",
  "timestamp": "2026-07-05T10:15:32.101Z"
}
```

---

## `GET /areas`

Returns the full list of seeded geographic areas.

**Path params**: none
**Query params**: none
**Request body**: none

**Example request**

```bash
curl http://localhost:5000/api/areas
```

**Example response — `200 OK`**

```json
{
  "data": [
    {
      "id": "indiranagar-blr",
      "name": "Indiranagar",
      "city": "Bengaluru",
      "state": "Karnataka",
      "center": { "lat": 12.9784, "lng": 77.6408 },
      "zoom": 14
    },
    {
      "id": "kothrud-pune",
      "name": "Kothrud",
      "city": "Pune",
      "state": "Maharashtra",
      "center": { "lat": 18.5074, "lng": 73.8077 },
      "zoom": 14
    },
    {
      "id": "dwarka-delhi",
      "name": "Dwarka",
      "city": "New Delhi",
      "state": "Delhi",
      "center": { "lat": 28.5921, "lng": 77.046 },
      "zoom": 13
    }
  ]
}
```

### Area object shape

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique area identifier |
| `name` | `string` | Area/neighborhood name |
| `city` | `string` | City |
| `state` | `string` | State |
| `center` | `{ lat: number, lng: number }` | Map center coordinates |
| `zoom` | `number` | Suggested map zoom level |

---

## `GET /areas/:id`

Returns a single area plus an aggregate spending summary for the projects
within it.

**Path params**

| Param | Type | Required | Constraints |
|---|---|---|---|
| `id` | `string` | Yes | Non-empty string (trimmed); validated via `param('id').isString().trim().notEmpty()` |

**Query params**: none
**Request body**: none

**Example request**

```bash
curl http://localhost:5000/api/areas/indiranagar-blr
```

**Example response — `200 OK`**

```json
{
  "data": {
    "id": "indiranagar-blr",
    "name": "Indiranagar",
    "city": "Bengaluru",
    "state": "Karnataka",
    "center": { "lat": 12.9784, "lng": 77.6408 },
    "zoom": 14,
    "summary": {
      "projectCount": 5,
      "totalBudget": 142000000,
      "totalSpent": 57400000
    }
  }
}
```

`summary` is derived from `statsService.getStatsForArea(area.id)` and only
exposes `projectCount`, `totalBudget`, and `totalSpent` (not the full
`spendByType`/`spendByStatus` breakdown returned by `/stats`).

**Example error response — `404 Not Found`** (unknown `id`)

```json
{
  "error": {
    "message": "Area 'does-not-exist' not found"
  }
}
```

---

## `GET /projects`

Returns a list of projects, optionally filtered by area, type, status,
and/or a free-text search term. This route is the single source of truth
for project filtering rules — filtering logic is not duplicated on the
frontend.

**Path params**: none

**Query params**

| Param | Type | Required | Default | Constraints |
|---|---|---|---|---|
| `areaId` | `string` | No | — | Non-empty string if provided. Must reference an existing area, otherwise `404`. |
| `type` | `string` | No | — | One of: `road`, `building`, `bridge`, `park`, `utility` |
| `status` | `string` | No | — | One of: `planned`, `in-progress`, `completed` |
| `q` | `string` | No | — | Free-text search, case-insensitive match against project `name`/`description`; max length 200 |

Multiple filters combine with AND semantics (e.g. `areaId` + `status`
returns only projects matching both).

**Request body**: none

**Example request**

```bash
curl "http://localhost:5000/api/projects?areaId=kothrud-pune&status=in-progress"
```

**Example response — `200 OK`**

```json
{
  "data": [
    {
      "id": "prj-pun-01",
      "areaId": "kothrud-pune",
      "name": "Kothrud-Warje Connector Road Upgrade",
      "type": "road",
      "status": "in-progress",
      "budget": 60000000,
      "spent": 34000000,
      "currency": "INR",
      "contractor": "Pune Municipal Corporation - Roads Dept",
      "startDate": "2025-10-01",
      "endDate": "2026-12-31",
      "location": { "lat": 18.501, "lng": 73.809 },
      "description": "Four-laning and drainage upgrade of the connector road between Kothrud Depot and Warje, including a dedicated bus corridor.",
      "spendingBreakdown": [
        { "category": "Road Widening", "amount": 18000000 },
        { "category": "Drainage Works", "amount": 9000000 },
        { "category": "Bus Corridor Infrastructure", "amount": 7000000 }
      ],
      "updates": [
        {
          "date": "2025-11-15",
          "title": "Utility Shifting Completed",
          "note": "Water and gas lines relocated ahead of widening work."
        }
      ]
    }
  ],
  "meta": { "count": 1 }
}
```

**Example error response — `400 Bad Request`** (invalid `type`)

```bash
curl "http://localhost:5000/api/projects?type=spaceship"
```

```json
{
  "error": {
    "message": "Invalid request parameters",
    "details": [
      { "field": "type", "message": "Invalid value" }
    ]
  }
}
```

**Example error response — `404 Not Found`** (unknown `areaId`)

```json
{
  "error": {
    "message": "Area 'not-a-real-area' not found"
  }
}
```

---

## `GET /projects/:id`

Returns full detail for a single project, including its spending breakdown
and update history.

**Path params**

| Param | Type | Required | Constraints |
|---|---|---|---|
| `id` | `string` | Yes | Non-empty string (trimmed) |

**Query params**: none
**Request body**: none

**Example request**

```bash
curl http://localhost:5000/api/projects/prj-blr-01
```

**Example response — `200 OK`**

```json
{
  "data": {
    "id": "prj-blr-01",
    "areaId": "indiranagar-blr",
    "name": "100 Feet Road Widening & Footpath Upgrade",
    "type": "road",
    "status": "planned",
    "budget": 45000000,
    "spent": 1200000,
    "currency": "INR",
    "contractor": "Karnataka Road Development Corporation",
    "startDate": "2026-09-01",
    "endDate": "2027-06-30",
    "location": { "lat": 12.975, "lng": 77.6389 },
    "description": "Widening of the 100 Feet Road stretch between CMH Road and Old Airport Road junction, including continuous footpaths, stormwater drains, and cycle lane markings.",
    "spendingBreakdown": [
      { "category": "Survey & Design", "amount": 800000 },
      { "category": "Mobilization Advance", "amount": 400000 }
    ],
    "updates": [
      {
        "date": "2026-05-10",
        "title": "Tender Awarded",
        "note": "Contract awarded to Karnataka Road Development Corporation after technical evaluation."
      },
      {
        "date": "2026-06-20",
        "title": "Survey Completed",
        "note": "Topographic survey and utility mapping completed ahead of construction start."
      }
    ]
  }
}
```

### Project object shape

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique project identifier |
| `areaId` | `string` | References an `Area.id` |
| `name` | `string` | Project name |
| `type` | `string` (enum) | One of `road`, `building`, `bridge`, `park`, `utility` |
| `status` | `string` (enum) | One of `planned`, `in-progress`, `completed` |
| `budget` | `number` | Total allocated budget |
| `spent` | `number` | Amount spent to date |
| `currency` | `string` | Currency code (currently always `INR`) |
| `contractor` | `string` | Contractor/agency name |
| `startDate` | `string` (ISO date) | Project start date |
| `endDate` | `string` (ISO date) | Project (expected/actual) end date |
| `location` | `{ lat: number, lng: number }` | Project coordinates |
| `description` | `string` | Free-text project description |
| `spendingBreakdown` | `Array<{ category: string, amount: number }>` | Spend broken out by category |
| `updates` | `Array<{ date: string, title: string, note: string }>` | Chronological project updates |

**Example error response — `404 Not Found`**

```json
{
  "error": {
    "message": "Project 'does-not-exist' not found"
  }
}
```

---

## `GET /stats`

Returns aggregate spending statistics, either globally (all areas/projects)
or scoped to a single area.

**Path params**: none

**Query params**

| Param | Type | Required | Default | Constraints |
|---|---|---|---|---|
| `areaId` | `string` | No | — (omitting returns global stats) | Non-empty string if provided; must reference an existing area, otherwise `404` |

**Request body**: none

**Example request (global)**

```bash
curl http://localhost:5000/api/stats
```

**Example response — `200 OK`**

```json
{
  "data": {
    "projectCount": 15,
    "totalBudget": 422000000,
    "totalSpent": 200930000,
    "spendByType": {
      "road": 49400000,
      "building": 37050000,
      "bridge": 58650000,
      "park": 17180000,
      "utility": 38650000
    },
    "spendByStatus": {
      "planned": 4850000,
      "in-progress": 98500000,
      "completed": 97580000
    }
  }
}
```

**Example request (scoped to one area)**

```bash
curl "http://localhost:5000/api/stats?areaId=indiranagar-blr"
```

**Example response — `200 OK`**

```json
{
  "data": {
    "projectCount": 5,
    "totalBudget": 142000000,
    "totalSpent": 57400000,
    "spendByType": {
      "road": 1200000,
      "building": 18500000,
      "bridge": 27400000,
      "park": 500000,
      "utility": 9800000
    },
    "spendByStatus": {
      "planned": 1700000,
      "in-progress": 28300000,
      "completed": 27400000
    }
  }
}
```

### Stats object shape

| Field | Type | Description |
|---|---|---|
| `projectCount` | `number` | Number of projects included in the aggregate |
| `totalBudget` | `number` | Sum of `budget` across included projects |
| `totalSpent` | `number` | Sum of `spent` across included projects |
| `spendByType` | `Object<string, number>` | `spent` summed per project `type` |
| `spendByStatus` | `Object<string, number>` | `spent` summed per project `status` |

**Example error response — `404 Not Found`** (unknown `areaId`)

```json
{
  "error": {
    "message": "Area 'nope' not found"
  }
}
```

---

## `GET /providers`

Returns the list of AI providers supported by `/chat`, driving the
frontend's provider-selection UI. Internal fields (such as each
provider's `baseUrl`) are intentionally never exposed.

**Path params**: none
**Query params**: none
**Request body**: none

**Example request**

```bash
curl http://localhost:5000/api/providers
```

**Example response — `200 OK`**

```json
{
  "data": [
    {
      "key": "anthropic",
      "label": "Claude (Anthropic)",
      "requiresApiKey": true,
      "defaultModel": "claude-3-5-sonnet-20241022"
    },
    {
      "key": "openai",
      "label": "OpenAI",
      "requiresApiKey": true,
      "defaultModel": "gpt-4o-mini"
    },
    {
      "key": "deepseek",
      "label": "Deepseek",
      "requiresApiKey": true,
      "defaultModel": "deepseek-chat"
    },
    {
      "key": "glm",
      "label": "GLM (Zhipu)",
      "requiresApiKey": true,
      "defaultModel": "glm-4"
    },
    {
      "key": "ollama",
      "label": "Ollama (local)",
      "requiresApiKey": false,
      "defaultModel": "llama3"
    },
    {
      "key": "ollamaCloud",
      "label": "Ollama Cloud",
      "requiresApiKey": true,
      "defaultModel": "gpt-oss:120b-cloud"
    }
  ]
}
```

### Provider object shape

| Field | Type | Description |
|---|---|---|
| `key` | `string` | Provider identifier — pass this as the `provider` field in `POST /chat` |
| `label` | `string` | Human-readable display name |
| `requiresApiKey` | `boolean` | Whether callers must supply `apiKey` on `/chat` |
| `defaultModel` | `string` | Model used if `model` is omitted in the `/chat` request |

### Supported providers (exact IDs, from `src/services/ai/providers/index.js`)

| `key` | `label` | Requires API key | Default model |
|---|---|---|---|
| `anthropic` | Claude (Anthropic) | Yes | `claude-3-5-sonnet-20241022` |
| `openai` | OpenAI | Yes | `gpt-4o-mini` |
| `deepseek` | Deepseek | Yes | `deepseek-chat` |
| `glm` | GLM (Zhipu) | Yes | `glm-4` |
| `ollama` | Ollama (local) | No | `llama3` |
| `ollamaCloud` | Ollama Cloud | Yes | `gpt-oss:120b-cloud` |

---

## `POST /chat`

Proxies a single chat turn to the caller's chosen AI provider.

### Bring-your-own-key model

This endpoint does **not** store any AI provider credentials server-side.
On every request the caller supplies:

- which `provider` to use (one of the keys from `GET /providers`),
- optionally which `model` to use (falls back to that provider's
  `defaultModel` if omitted),
- the provider's `apiKey`, if that provider requires one (`ollama` — a
  locally running instance — is the only provider that does not).

The `apiKey` is read from the request body, forwarded to the relevant
provider adapter (`src/services/ai/providers/*.js`) for the lifetime of
that single outbound call only, and is never logged (request logging via
`morgan` only logs method/path/status, not bodies) or persisted anywhere.
Error responses are also scrubbed to only ever surface the provider's own
`message` field — never the caller's key, headers, or the full raw
response body (see `src/services/ai/providers/errorUtils.js`).

If `projectId` is supplied, the backend builds a system prompt that
includes that project's name, type, status, budget, amount spent,
contractor, its area, spending breakdown, and recent updates — so the
model can answer questions about the project the user is currently
viewing without the frontend needing to construct that context itself.

### Request body schema

| Field | Type | Required | Constraints |
|---|---|---|---|
| `provider` | `string` | Yes | Must be one of `VALID_PROVIDER_KEYS`: `anthropic`, `openai`, `deepseek`, `glm`, `ollama`, `ollamaCloud` |
| `apiKey` | `string` | Conditionally | Optional at the validation layer, but required by the service layer for any provider where `requiresApiKey` is `true` (all except `ollama`) — returns `400` if missing for such a provider |
| `model` | `string` | No | Non-empty string if provided; defaults to the provider's `defaultModel` |
| `projectId` | `string` | No | Non-empty string if provided; must reference an existing project, otherwise `404` |
| `messages` | `Array<{ role, content }>` | Yes | Non-empty array |
| `messages[].role` | `string` | Yes | Must be `user` or `assistant` |
| `messages[].content` | `string` | Yes | Non-empty string (trimmed) |

### Example request

```bash
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "anthropic",
    "apiKey": "sk-ant-...",
    "model": "claude-3-5-sonnet-20241022",
    "projectId": "prj-blr-01",
    "messages": [
      { "role": "user", "content": "How much has been spent so far?" }
    ]
  }'
```

### Example response — `200 OK`

```json
{
  "reply": "So far, INR 1,200,000 has been spent out of a total budget of INR 45,000,000 for the 100 Feet Road Widening & Footpath Upgrade project."
}
```

### Example error responses

**`400 Bad Request`** — missing/invalid `provider` field:

```json
{
  "error": {
    "message": "Invalid request parameters",
    "details": [
      { "field": "provider", "message": "provider must be one of: anthropic, openai, deepseek, glm, ollama, ollamaCloud" }
    ]
  }
}
```

**`400 Bad Request`** — empty `messages` array:

```json
{
  "error": {
    "message": "Invalid request parameters",
    "details": [
      { "field": "messages", "message": "messages must be a non-empty array" }
    ]
  }
}
```

**`400 Bad Request`** — provider requires an API key but none was supplied
(business-rule check performed in `chat.service.js`, not the route
validator):

```json
{
  "error": {
    "message": "Provider 'anthropic' requires an API key"
  }
}
```

**`404 Not Found`** — `projectId` does not reference a real project:

```json
{
  "error": {
    "message": "Project 'does-not-exist' not found"
  }
}
```

**`401 Unauthorized`** — the upstream provider rejected the API key
(provider's own `401`/`403` is mapped to `401`; only the provider's own
error message is surfaced, the caller's key is never echoed back):

```json
{
  "error": {
    "message": "invalid x-api-key"
  }
}
```

**`429 Too Many Requests`** — the upstream provider rate-limited the call:

```json
{
  "error": {
    "message": "rate limit exceeded"
  }
}
```

**`502 Bad Gateway`** — the backend could not reach the provider, or the
provider returned an unexpected/empty response:

```json
{
  "error": {
    "message": "Failed to reach the Anthropic API"
  }
}
```

**`503 Service Unavailable`** — `provider: "ollama"` was requested but no
local Ollama instance is reachable at `OLLAMA_BASE_URL` (defaults to
`http://localhost:11434`):

```json
{
  "error": {
    "message": "Ollama is not running locally. Start Ollama (`ollama serve`) and try again."
  }
}
```
