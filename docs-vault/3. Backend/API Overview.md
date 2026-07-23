---
title: "API Overview"
aliases: ["REST API", "Endpoints"]
tags: ["#backend", "#api"]
created: "2026-07-17"
updated: "2026-07-17"
---

# API Overview

TransitOps exposes a RESTful API heavily typed with [[Validation & Error Handling|Pydantic]].

## Base URL
All API routes are prefixed with `/api`. For example, `/api/vehicles`.

## Standard Response Format
To ensure frontend consistency, most endpoints wrap their responses in a standard payload schema:
```json
{
  "success": true,
  "message": "Resource fetched successfully",
  "data": { ... } // or [ ... ]
}
```

## Pagination & Searching
List endpoints (like fetching vehicles or trips) typically accept `page`, `page_size`, and `search` query parameters.

Example Request:
`GET /api/trips?search=TRP-123&page=1&page_size=20`

Example Response:
```json
{
  "success": true,
  "data": {
    "items": [...],
    "total": 145,
    "page": 1,
    "page_size": 20,
    "total_pages": 8
  }
}
```

## OpenAPI Documentation
Because we use FastAPI, live API documentation is automatically generated.
While running the server locally, visit:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`
