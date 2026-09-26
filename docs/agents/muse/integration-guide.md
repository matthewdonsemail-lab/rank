# Muse Integration Guide for Rank

This guide provides step-by-step instructions for enabling Rank by ListeningKit to work with Meta's Muse AI agent.

## Prerequisites

Before enabling Muse integration, ensure:

1. **Rank API is publicly accessible** - Muse needs to reach your API endpoints
2. **Authentication system is configured** - OAuth 2.0 or API key authentication
3. **API endpoints are documented** - Clear documentation of available capabilities
4. **Rate limiting is configured** - To handle agent traffic appropriately
5. **Error handling is robust** - Agents retry requests, so handle idempotency

## Step 1: Document Your API

### Option A: Create OpenAPI Specification (Recommended)

Create an OpenAPI 3.1 specification that documents Rank's capabilities:

```yaml
openapi: 3.1.0
info:
  title: Rank by ListeningKit API
  version: 1.0.0
  description: AI-assisted link-building and backlink prospect ranking engine
  contact:
    name: ListeningKit
    url: https://listeningkit.com
servers:
  - url: https://api.rank.listeningkit.com/v1
    description: Production API
  - url: https://dev-api.rank.listeningkit.com/v1
    description: Development API

security:
  - ClerkAuth: []
  - ApiKeyAuth: []

components:
  securitySchemes:
    ClerkAuth:
      type: oauth2
      flows:
        authorizationCode:
          authorizationUrl: https://rank.listeningkit.com/oauth/authorize
          tokenUrl: https://rank.listeningkit.com/oauth/token
          scopes:
            read: Read access to Rank data
            write: Write access to Rank data
    ApiKeyAuth:
      type: apiKey
      in: header
      name: X-API-Key
```

### Option B: Create Markdown Documentation

Create human-readable documentation:

```markdown
# Rank API Documentation for Muse

## Base URL
https://api.rank.listeningkit.com/v1

## Authentication
Rank supports two authentication methods:

### OAuth 2.0 (Recommended)
- Authorization URL: https://rank.listeningkit.com/oauth/authorize
- Token URL: https://rank.listeningkit.com/oauth/token
- Scopes: `read` (read access), `write` (write access)

### API Key
- Header: `X-API-Key: your-api-key`
- Get API key from: https://rank.listeningkit.com/settings/api-keys

## Available Endpoints

### Brand Analysis
- `POST /brand/analyze` - Analyze a brand website
- `GET /brand/{id}` - Get brand analysis results
- `PUT /brand/{id}` - Update brand configuration

### Prospect Discovery
- `POST /prospects/discover` - Find competitor domains
- `GET /prospects/{id}` - Get prospect details
- `GET /prospects?brand_id={id}` - List prospects for a brand

### Prospect Evaluation
- `POST /prospects/{id}/evaluate` - Evaluate a prospect
- `GET /prospects/{id}/judgment` - Get evaluation judgment

### Outbound Workflow
- `POST /outbound/contact` - Resolve contact information
- `POST /outbound/send` - Send outreach email
- `GET /outbound/{id}` - Get outbound status
```

## Step 2: Host Documentation Publicly

Make your API documentation accessible at a public URL:

### For OpenAPI Specification

```bash
# Host OpenAPI spec
# Option 1: Static hosting
cp openapi-rank.yaml public/api-spec.yaml

# Option 2: GitHub Pages
git subtree push --prefix docs origin gh-pages

# Option 3: API documentation service
# Upload to SwaggerHub, Stoplight, or similar
```

### For Markdown Documentation

```bash
# Host markdown docs
# Option 1: Static site generator
npm run docs:build

# Option 2: GitHub Pages
# Upload to GitHub repository

# Option 3: Documentation platform
# Upload to GitBook, ReadMe, or similar
```

**Important:** Muse needs to be able to read the documentation URL without authentication.

## Step 3: Design Idempotent Endpoints

Agents retry requests, so design endpoints to be idempotent:

```typescript
// Bad: Non-idempotent
app.post('/prospects/discover', async (req, res) => {
  const prospect = await createProspect(req.body);
  res.json(prospect);
});

// Good: Idempotent with idempotency key
app.post('/prospects/discover', async (req, res) => {
  const idempotencyKey = req.headers['x-idempotency-key'];
  
  // Check if already processed
  const existing = await getProspectByIdempotencyKey(idempotencyKey);
  if (existing) {
    return res.json(existing);
  }
  
  const prospect = await createProspect(req.body);
  await storeIdempotencyKey(idempotencyKey, prospect.id);
  res.json(prospect);
});
```

## Step 4: Implement Proper Error Handling

Provide clear, human-readable error messages:

```typescript
// Bad: Generic error
res.status(500).json({ error: 'Internal server error' });

// Good: Specific, actionable error
res.status(400).json({
  error: 'Invalid brand URL',
  message: 'The provided URL is not accessible or does not contain brand information',
  details: {
    url: req.body.url,
    reason: 'HTTP 404 Not Found'
  },
  suggestion: 'Please verify the URL is publicly accessible and contains brand content'
});
```

## Step 5: Configure Rate Limiting

Protect your API from agent traffic:

```typescript
// Implement rate limiting
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);
```

## Step 6: Test with Muse

### Testing Custom Connector

1. **Prepare your documentation URL**:
   ```
   https://rank.listeningkit.com/docs/muse/api-specification.md
   ```

2. **Test with Muse**:
   ```
   "Create a custom connector for Rank by ListeningKit, 
   an AI-assisted link-building tool. Read the API documentation 
   at https://rank.listeningkit.com/docs/muse/api-specification.md 
   for the base URL, authentication, and available endpoints. 
   Use OAuth authentication when available."
   ```

3. **Monitor the connection process**:
   - Muse should read your documentation
   - Muse should attempt to authenticate
   - Muse should test a few endpoints
   - Muse should report success or specific errors

### Testing OpenAPI Specification

```bash
# Validate your OpenAPI spec
npm install -g @apidevtools/swagger-cli
swagger-cli validate openapi-rank.yaml

# Test with Muse
# Use the same process as above, but point to the OpenAPI URL
```

## Step 7: Submit to Muse Directory (Optional)

For official directory listing:

1. **Visit Muse Connector Platform**: https://muse.ai/platform
2. **Submit your connector**:
   - Describe your product
   - Provide documentation URL
   - Explain use cases
3. **Wait for Meta review**:
   - Functional testing
   - Security review
   - Legal requirements
   - End-to-end testing

## Step 8: Monitor and Iterate

### Monitor Usage

```typescript
// Add logging for Muse requests
app.use((req, res, next) => {
  const userAgent = req.headers['user-agent'];
  if (userAgent?.includes('Muse')) {
    logger.info('Muse request', {
      endpoint: req.path,
      method: req.method,
      ip: req.ip,
      timestamp: new Date().toISOString()
    });
  }
  next();
});
```

### Gather Feedback

- Monitor error rates from Muse requests
- Track which endpoints are most used
- Collect user feedback on connector performance
- Update documentation based on common issues

## Troubleshooting

### Common Issues

**Issue: Muse cannot read documentation**
- Ensure documentation URL is publicly accessible
- Check for authentication requirements on documentation URL
- Verify SSL certificate is valid
- Test URL in browser without authentication

**Issue: Authentication fails**
- Verify OAuth endpoints are correct
- Check API key format and requirements
- Ensure token URL is accessible from Meta's servers
- Test authentication manually

**Issue: Muse times out**
- Check API response times
- Implement proper timeout handling
- Add caching for expensive operations
- Consider async processing for long tasks

**Issue: Rate limiting errors**
- Adjust rate limits for agent traffic
- Implement proper backoff strategies
- Provide clear rate limit headers
- Document rate limits in API spec

## Best Practices

1. **Documentation Quality**
   - Keep documentation up to date
   - Include examples for each endpoint
   - Document error responses thoroughly
   - Provide troubleshooting guides

2. **API Design**
   - Use RESTful conventions
   - Provide consistent response formats
   - Include helpful error messages
   - Design for idempotency

3. **Security**
   - Implement proper authentication
   - Use HTTPS everywhere
   - Validate all inputs
   - Log security events

4. **Performance**
   - Optimize response times
   - Implement caching where appropriate
   - Use efficient data structures
   - Monitor and optimize database queries

## Next Steps

1. Create your OpenAPI specification or markdown documentation
2. Host documentation publicly
3. Test with Muse's custom connector builder
4. Monitor usage and iterate based on feedback
5. Consider submitting to official Muse directory

## Additional Resources

- [OpenAPI Specification](https://spec.openapis.org/oas/v3.1.0)
- [Muse Connector Platform](https://muse.ai/platform)
- [Muse Help Center](https://www.meta.com/help/artificial-intelligence/1687253048996149/)
- [Rank API Documentation](../backend-reference.md)
