# Muse Integration for Rank

This directory contains documentation and scripts for integrating Rank by ListeningKit with Meta's Muse AI agent.

## Overview

Meta's Muse is a consumer AI agent that can connect to third-party services through "connectors." Unlike traditional integration platforms, Muse uses a spec-driven approach where the agent reads API documentation and builds connectors automatically.

## Key Concepts

### No Traditional SDK/Library

Muse does not provide a connector SDK or library that developers install. Instead:

- **Directory Connectors**: Official connectors submitted through muse.ai/platform with Meta review
- **Custom Connectors**: Built on-demand by Muse when users request connection to a service
- **Spec-Driven**: Your API documentation becomes the "connector library"

### How Muse Integration Works

1. You provide API documentation (OpenAPI specification preferred)
2. User tells Muse: "Connect to Rank by ListeningKit"
3. Muse reads your API documentation
4. Muse builds the connector automatically
5. User authenticates (OAuth or API key)
6. Connector is ready to use

### Architecture

- **Muse Secure VM**: Each user gets a dedicated virtual machine in Meta's cloud
- **Auto-Built Connectors**: Muse reads specs and writes its own integration code
- **No Provider-Side Installation**: Services don't need to install connector code
- **Spec-Driven Integration**: Your API documentation becomes the integration point

## Integration Strategy for Rank

### Rank's Current Capabilities

Rank provides these core capabilities that could be exposed to Muse:

1. **Brand Grounding**: Ingest and analyze brand websites
2. **Prospect Discovery**: Find competitor domains and backlink opportunities
3. **Prospect Evaluation**: Rank and judge prospects using AI
4. **Outbound Workflow**: Contact resolution and guest-post outreach

### Recommended Integration Approach

#### Option 1: OpenAPI Specification (Recommended)

Create a comprehensive OpenAPI 3.1 specification that documents Rank's capabilities:

```yaml
openapi: 3.1.0
info:
  title: Rank by ListeningKit API
  version: 1.0.0
  description: AI-assisted link-building and backlink prospect ranking engine
servers:
  - url: https://api.rank.listeningkit.com
    description: Production API
```

**Advantages:**
- Machine-readable standard
- Muse can auto-generate connectors
- Industry standard
- Works with other agent platforms

#### Option 2: Markdown Documentation

Create human-readable documentation that Muse can parse:

```markdown
# Rank API Documentation

## Authentication
- OAuth 2.0 with Clerk
- API key alternative

## Endpoints
### Brand Analysis
- POST /api/brand/analyze - Analyze brand website
- GET /api/brand/{id} - Get brand analysis results

### Prospect Discovery  
- POST /api/prospects/discover - Find competitor domains
- GET /api/prospects/{id} - Get prospect details
```

**Advantages:**
- Easy to maintain
- Human-readable
- Can include examples
- Flexible format

## Documentation Structure

```
docs/agents/muse/
├── README.md                    # This file
├── SUMMARY.md                   # Documentation summary
├── integration-guide.md         # Step-by-step integration guide
├── api-specification.md         # Rank API documentation for Muse
├── openapi-rank.yaml           # OpenAPI specification
├── capabilities.md             # Detailed capability descriptions
└── authentication.md           # Authentication methods
```

## Quick Start

### For Users to Connect Rank to Muse

1. Ensure Rank API is publicly accessible
2. Provide OpenAPI specification at a public URL
3. User tells Muse: "Connect to Rank by ListeningKit"
4. Muse reads the specification
5. User authenticates with their Rank account
6. Muse can now use Rank capabilities

### For Developers to Enable Muse Integration

1. Create comprehensive API documentation
2. Host OpenAPI specification at a public URL
3. Ensure authentication is properly documented
4. Test the specification with Muse's custom connector builder
5. Consider submitting to official Muse connector directory

## Next Steps

1. Review [integration-guide.md](integration-guide.md) for detailed setup
2. Check [api-specification.md](api-specification.md) for API documentation
3. Examine [openapi-rank.yaml](openapi-rank.yaml) for the OpenAPI spec
4. Run `node scripts/pull-muse-docs.mjs` to pull latest Muse documentation

## Resources

- [Muse Connector Platform](https://muse.ai/platform)
- [Muse Help Center - Connectors](https://www.meta.com/help/artificial-intelligence/1687253048996149/)
- [Muse Code SDK](https://github.com/meta-models/muse-code-sdk) (for Muse Code, not consumer agent)
- [OpenAPI Specification](https://spec.openapis.org/oas/v3.1.0)
