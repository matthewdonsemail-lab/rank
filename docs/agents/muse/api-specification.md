# Rank API Specification for Muse

This document provides the API specification that Muse needs to integrate with Rank by ListeningKit.

## Base URL

```
https://api.rank.listeningkit.com/v1
```

## Authentication

Rank supports two authentication methods:

### OAuth 2.0 (Recommended)

**Authorization Flow:**
- Authorization URL: `https://rank.listeningkit.com/oauth/authorize`
- Token URL: `https://rank.listeningkit.com/oauth/token`
- Scopes:
  - `read`: Read access to Rank data
  - `write`: Write access to Rank data

**Example Request:**
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### API Key

**Header Format:**
```http
X-API-Key: your-api-key-here
```

**Get API Key:** https://rank.listeningkit.com/settings/api-keys

## Core Capabilities

### 1. Brand Analysis

Analyze brand websites to extract identity, offerings, and content.

#### POST /brand/analyze

Analyze a brand website and extract structured information.

**Request Body:**
```json
{
  "url": "https://example.com",
  "depth": 2,
  "include_content": true
}
```

**Response:**
```json
{
  "id": "brand_abc123",
  "url": "https://example.com",
  "name": "Example Company",
  "tagline": "Building the future",
  "offerings": [
    {
      "name": "Product A",
      "description": "Description of Product A",
      "category": "software"
    }
  ],
  "sources": [
    {
      "url": "https://example.com/blog/post-1",
      "title": "Blog Post Title",
      "content": "Extracted content..."
    }
  ],
  "voice": "professional and authoritative",
  "created_at": "2026-09-27T00:00:00Z"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid URL or parameters
- `404 Not Found`: URL not accessible
- `429 Too Many Requests`: Rate limit exceeded

#### GET /brand/{id}

Retrieve brand analysis results.

**Response:** Same as POST /brand/analyze response

#### PUT /brand/{id}

Update brand configuration.

**Request Body:**
```json
{
  "offerings": [...],
  "voice": "updated voice description"
}
```

### 2. Prospect Discovery

Find competitor domains and backlink opportunities.

#### POST /prospects/discover

Discover competitor domains and shared search terms.

**Request Body:**
```json
{
  "brand_id": "brand_abc123",
  "limit": 50,
  "include_shared_terms": true
}
```

**Response:**
```json
{
  "brand_id": "brand_abc123",
  "candidates": [
    {
      "id": "prospect_xyz789",
      "domain": "competitor.com",
      "name": "Competitor Name",
      "shared_terms": ["keyword1", "keyword2"],
      "authority_score": 75
    }
  ],
  "total_found": 42,
  "created_at": "2026-09-27T00:00:00Z"
}
```

#### GET /prospects/{id}

Retrieve prospect details.

**Response:**
```json
{
  "id": "prospect_xyz789",
  "domain": "competitor.com",
  "name": "Competitor Name",
  "homepage_title": "Competitor Homepage",
  "homepage_description": "Description of competitor",
  "shared_terms": ["keyword1", "keyword2"],
  "authority_score": 75,
  "created_at": "2026-09-27T00:00:00Z"
}
```

#### GET /prospects

List prospects for a brand.

**Query Parameters:**
- `brand_id` (required): Brand ID
- `limit` (optional): Maximum results (default: 50)
- `offset` (optional): Pagination offset (default: 0)

**Response:**
```json
{
  "prospects": [...],
  "total": 42,
  "limit": 50,
  "offset": 0
}
```

### 3. Prospect Evaluation

Rank and judge prospects using AI evaluation.

#### POST /prospects/{id}/evaluate

Evaluate a prospect's relevance and fit.

**Request Body:**
```json
{
  "read_homepage": true,
  "limit": 10
}
```

**Response:**
```json
{
  "prospect_id": "prospect_xyz789",
  "judgment": "act",
  "confidence": 0.85,
  "reasons": [
    "High domain authority",
    "Relevant content overlap",
    "Editorial fit confirmed"
  ],
  "rerank_score": 0.92,
  "metrics": {
    "rerank_status": "completed",
    "homepage_read": true
  },
  "created_at": "2026-09-27T00:00:00Z"
}
```

**Judgment Values:**
- `act`: Pursue this prospect
- `review`: Requires human review
- `drop`: Do not pursue

#### GET /prospects/{id}/judgment

Get evaluation judgment for a prospect.

**Response:** Same as POST /prospects/{id}/evaluate response

### 4. Outbound Workflow

Contact resolution and guest-post outreach.

#### POST /outbound/contact

Resolve contact information for a prospect.

**Request Body:**
```json
{
  "prospect_id": "prospect_xyz789",
  "contact_type": "email"
}
```

**Response:**
```json
{
  "prospect_id": "prospect_xyz789",
  "contact": {
    "email": "contact@competitor.com",
    "name": "Contact Name",
    "role": "Editor",
    "deliverable": true
  },
  "created_at": "2026-09-27T00:00:00Z"
}
```

#### POST /outbound/send

Send outreach email to a prospect.

**Request Body:**
```json
{
  "prospect_id": "prospect_xyz789",
  "contact_id": "contact_abc123",
  "subject": "Guest Post Proposal",
  "content": "Email content...",
  "template": "guest-post-pitch"
}
```

**Response:**
```json
{
  "outbound_id": "outbound_def456",
  "prospect_id": "prospect_xyz789",
  "status": "sent",
  "sent_at": "2026-09-27T00:00:00Z",
  "message_id": "msg_789xyz"
}
```

#### GET /outbound/{id}

Get outbound campaign status.

**Response:**
```json
{
  "outbound_id": "outbound_def456",
  "prospect_id": "prospect_xyz789",
  "status": "replied",
  "sent_at": "2026-09-27T00:00:00Z",
  "replied_at": "2026-09-27T12:00:00Z",
  "reply_sentiment": "positive",
  "deal_likelihood": 0.75
}
```

**Status Values:**
- `draft`: Email drafted but not sent
- `sent`: Email sent, awaiting response
- `replied`: Prospect replied
- `deal`: Converted to deal
- `failed`: Failed to send

## Common Response Format

All endpoints follow this response structure:

**Success Response:**
```json
{
  "data": { /* endpoint-specific data */ },
  "meta": {
    "request_id": "req_abc123",
    "timestamp": "2026-09-27T00:00:00Z"
  }
}
```

**Error Response:**
```json
{
  "error": {
    "code": "INVALID_URL",
    "message": "The provided URL is not accessible",
    "details": {
      "url": "https://invalid-url.com",
      "reason": "HTTP 404 Not Found"
    },
    "suggestion": "Please verify the URL is publicly accessible"
  },
  "meta": {
    "request_id": "req_abc123",
    "timestamp": "2026-09-27T00:00:00Z"
  }
}
```

## Rate Limiting

- **Default**: 100 requests per 15 minutes per IP
- **Premium**: 1000 requests per 15 minutes per IP
- **Headers**: 
  - `X-RateLimit-Limit`: Request limit
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Reset time (Unix timestamp)

## Idempotency

All POST/PUT endpoints support idempotency via the `X-Idempotency-Key` header:

```http
X-Idempotency-Key: unique-key-for-this-request
```

If a request with the same idempotency key is received, the original response is returned.

## Webhooks

Rank can send webhook notifications for events:

**Webhook Events:**
- `brand.analysis_completed`: Brand analysis finished
- `prospect.discovered`: New prospect discovered
- `prospect.evaluated`: Prospect evaluation completed
- `outbound.sent`: Outreach email sent
- `outbound.replied`: Prospect replied

**Webhook Payload:**
```json
{
  "event": "prospect.evaluated",
  "data": { /* event-specific data */ },
  "timestamp": "2026-09-27T00:00:00Z"
}
```

## Pagination

List endpoints support pagination via `limit` and `offset` parameters:

```http
GET /prospects?brand_id=brand_abc123&limit=20&offset=40
```

**Response includes:**
```json
{
  "data": [...],
  "pagination": {
    "total": 42,
    "limit": 20,
    "offset": 40,
    "has_more": true
  }
}
```

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_REQUEST` | 400 | Request parameters are invalid |
| `UNAUTHORIZED` | 401 | Authentication failed |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `RATE_LIMITED` | 429 | Rate limit exceeded |
| `INTERNAL_ERROR` | 500 | Internal server error |
| `SERVICE_UNAVAILABLE` | 503 | Service temporarily unavailable |

## SDK and Libraries

While Muse doesn't require a traditional SDK, Rank provides client libraries for other platforms:

- **JavaScript/TypeScript**: `@rank/sdk` (npm)
- **Python**: `rank-sdk` (pip)
- **Go**: `github.com/listeningkit/rank-go`

## Support

- **Documentation**: https://docs.rank.listeningkit.com
- **API Status**: https://status.rank.listeningkit.com
- **Support Email**: api-support@listeningkit.com
- **GitHub Issues**: https://github.com/listeningkit/rank/issues