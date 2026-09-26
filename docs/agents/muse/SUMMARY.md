# Muse Integration Documentation Summary

This is a summary of the Muse integration documentation for Rank by ListeningKit.

## What This Documentation Covers

This documentation provides everything needed to integrate Rank by ListeningKit with Meta's Muse AI agent:

### Key Files

1. **README.md** - Overview and quick start guide
2. **integration-guide.md** - Step-by-step integration instructions
3. **api-specification.md** - Detailed API documentation for Muse
4. **openapi-rank.yaml** - OpenAPI 3.1 specification
5. **capabilities.md** - Detailed capability descriptions and use cases
6. **authentication.md** - Authentication methods and security

### Documentation Scripts

- **pull-muse-docs.mjs** - Pull latest Muse documentation from official sources (located in scripts/)

## How Muse Integration Works

### No Traditional SDK/Library

Unlike other agent platforms, Muse does not provide a connector SDK. Instead:

- You provide API documentation (OpenAPI specification preferred)
- Muse reads your documentation and builds the connector automatically
- The connector runs in Muse's Secure VM
- No code installation required on your end

### Integration Process

1. **Document Your API** - Create OpenAPI spec or markdown documentation
2. **Host Documentation Publicly** - Make it accessible at a public URL
3. **User Connects to Muse** - User tells Muse to connect to Rank
4. **Muse Builds Connector** - Muse reads documentation and builds integration
5. **User Authenticates** - User authorizes Muse to access their Rank account
6. **Ready to Use** - Muse can now use Rank capabilities

## Rank Capabilities Exposed to Muse

### 1. Brand Analysis
- Analyze brand websites
- Extract identity, offerings, and content
- Determine brand voice and topics

### 2. Prospect Discovery
- Find competitor domains
- Identify shared search terms
- Discover backlink opportunities

### 3. Prospect Evaluation
- AI-powered ranking using Nebius
- Editorial fit analysis using TypeSafe
- Judgment: act/review/drop with confidence

### 4. Contact Resolution
- Find and validate contact information
- Email deliverability checking
- Contact role identification

### 5. Outreach Workflow
- Send personalized outreach emails
- Track campaign status
- Monitor responses and sentiment

## Authentication

### OAuth 2.0 (Recommended)
- Authorization Code flow
- Scopes: `read` and `write`
- Secure token-based authentication
- User-controlled permissions

### API Key (Alternative)
- Simple header-based authentication
- X-API-Key header
- Suitable for testing and limited integrations

## Quick Start for Users

To connect Rank to Muse:

```
"Create a custom connector for Rank by ListeningKit, 
an AI-assisted link-building tool. Read the API documentation 
at https://rank.listeningkit.com/docs/muse/api-specification.md 
for the base URL, authentication, and available endpoints. 
Use OAuth authentication when available."
```

## Next Steps

### For Documentation Maintenance

1. **Pull latest Muse docs**: `node scripts/pull-muse-docs.mjs`

### For Integration

1. Review all documentation files
2. Ensure API endpoints match current implementation
3. Test authentication methods
4. Host documentation publicly
5. Test with Muse's custom connector builder

### For Production

1. Consider submitting to official Muse directory
2. Monitor usage and performance
3. Implement proper rate limiting
4. Set up monitoring and alerting
5. Create user guides and support documentation

## Resources

- **Muse Connector Platform**: https://muse.ai/platform
- **Muse Help Center**: https://www.meta.com/help/artificial-intelligence/1687253048996149/
- **Muse Code SDK**: https://github.com/meta-models/muse-code-sdk
- **OpenAPI Specification**: https://spec.openapis.org/oas/v3.1.0
- **Rank Documentation**: ../backend-reference.md

## Notes

- This documentation is designed to be read by both humans and AI agents
- The OpenAPI specification is machine-readable and follows industry standards
- All authentication methods are documented with security best practices
- Error handling and troubleshooting guides are included
- The documentation is maintained to stay current with both Rank and Muse

## Status

- **Documentation Version**: 1.0.0
- **Last Updated**: 2026-09-27
- **Muse Platform Status**: Active (as of 2026-09-27)
- **Rank API Status**: Development (Convex backend implemented)