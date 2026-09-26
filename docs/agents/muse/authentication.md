# Authentication Methods for Rank API

This document details the authentication methods available for Rank API when integrating with Muse.

## Overview

Rank supports two authentication methods:

1. **OAuth 2.0** (Recommended) - Secure, token-based authentication
2. **API Key** - Simple header-based authentication

## OAuth 2.0 Authentication

### Flow Type: Authorization Code

Rank uses the OAuth 2.0 Authorization Code flow, which is the most secure method for server-side applications.

### Endpoints

- **Authorization URL**: `https://rank.listeningkit.com/oauth/authorize`
- **Token URL**: `https://rank.listeningkit.com/oauth/token`

### Scopes

| Scope | Description | Use Case |
|-------|-------------|----------|
| `read` | Read access to Rank data | Brand analysis, prospect discovery, evaluation |
| `write` | Write access to Rank data | Outbound campaigns, contact resolution |

### OAuth Flow for Muse

#### Step 1: Authorization Request

Muse directs the user to the authorization endpoint:

```
GET https://rank.listeningkit.com/oauth/authorize?
  response_type=code&
  client_id=YOUR_CLIENT_ID&
  redirect_uri=https://muse.meta.com/oauth/callback&
  scope=read write&
  state=RANDOM_STATE_STRING
```

#### Step 2: User Authorization

User logs in to Rank and grants permissions to Muse.

#### Step 3: Authorization Code

Rank redirects back to Muse with an authorization code:

```
https://muse.meta.com/oauth/callback?
  code=AUTHORIZATION_CODE&
  state=RANDOM_STATE_STRING
```

#### Step 4: Token Exchange

Muse exchanges the authorization code for an access token:

```
POST https://rank.listeningkit.com/oauth/token
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code&
code=AUTHORIZATION_CODE&
redirect_uri=https://muse.meta.com/oauth/callback&
client_id=YOUR_CLIENT_ID&
client_secret=YOUR_CLIENT_SECRET
```

#### Step 5: Access Token Response

Rank returns the access token:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "refresh_token_here",
  "scope": "read write"
}
```

#### Step 6: API Requests

Muse uses the access token in API requests:

```http
GET /v1/brand/brand_abc123
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Token Refresh

When the access token expires, Muse can refresh it:

```
POST https://rank.listeningkit.com/oauth/token
Content-Type: application/x-www-form-urlencoded

grant_type=refresh_token&
refresh_token=REFRESH_TOKEN&
client_id=YOUR_CLIENT_ID&
client_secret=YOUR_CLIENT_SECRET
```

## API Key Authentication

### Overview

API key authentication is simpler but less secure than OAuth. It's suitable for testing and limited integrations.

### Getting an API Key

1. Log in to Rank at https://rank.listeningkit.com
2. Navigate to Settings → API Keys
3. Click "Create API Key"
4. Name the key (e.g., "Muse Integration")
5. Copy the generated key

### Using API Key

Include the API key in the `X-API-Key` header:

```http
GET /v1/brand/brand_abc123
X-API-Key: your-api-key-here
```

### API Key Security

- **Never expose API keys in client-side code**
- **Rotate API keys regularly**
- **Use environment variables for key storage**
- **Revoke compromised keys immediately**

## Authentication for Muse Integration

### Recommended Approach: OAuth 2.0

For Muse integration, OAuth 2.0 is recommended because:

1. **Security**: Token-based authentication is more secure than API keys
2. **User Control**: Users explicitly grant permissions to Muse
3. **Revocability**: Users can revoke access at any time
4. **Scope Limitation**: Fine-grained control over what Muse can access
5. **Standard**: OAuth is the industry standard for agent authentication

### Muse-Specific Considerations

#### Client Registration

To use OAuth with Muse, you need to register Muse as a client:

1. Contact Rank to register Muse as an OAuth client
2. Provide Muse's redirect URI: `https://muse.meta.com/oauth/callback`
3. Receive client ID and client secret
4. Include these in your connector documentation

#### Muse Authentication Flow

When a user connects Rank to Muse:

1. **User Request**: "Connect to Rank by ListeningKit"
2. **Muse Initiates OAuth**: Muse starts the OAuth flow
3. **User Authorization**: User logs in to Rank and grants permissions
4. **Token Storage**: Muse securely stores the access token
5. **API Access**: Muse uses the token for API requests
6. **Token Refresh**: Muse refreshes tokens automatically

#### Token Storage

Muse stores tokens in its Secure Credentials Store:
- Tokens are encrypted at rest
- Tokens are never logged or exposed
- Tokens are automatically refreshed when expired
- Users can revoke access from Rank settings

## Error Handling

### OAuth Errors

| Error Code | Description | Resolution |
|------------|-------------|------------|
| `invalid_request` | Invalid request parameters | Check request format |
| `unauthorized_client` | Client not authorized | Register client with Rank |
| `access_denied` | User denied access | User must grant permissions |
| `invalid_grant` | Invalid authorization code | Request new authorization code |
| `invalid_scope` | Invalid scope requested | Use valid scopes |

### API Key Errors

| Error Code | Description | Resolution |
|------------|-------------|------------|
| `invalid_api_key` | Invalid API key | Check API key format |
| `expired_api_key` | API key expired | Generate new key |
| `revoked_api_key` | API key revoked | Generate new key |

### API Request Errors

| HTTP Status | Description | Resolution |
|-------------|-------------|------------|
| `401 Unauthorized` | Invalid or expired token | Refresh token or re-authenticate |
| `403 Forbidden` | Insufficient permissions | Request appropriate scope |
| `429 Too Many Requests` | Rate limit exceeded | Implement backoff strategy |

## Security Best Practices

### For OAuth Implementation

1. **Use HTTPS** for all OAuth endpoints
2. **Validate state parameter** to prevent CSRF attacks
3. **Use PKCE** (Proof Key for Code Exchange) for additional security
4. **Store secrets securely** using environment variables
5. **Implement token refresh** logic
6. **Revoke tokens** when user disconnects

### For API Key Implementation

1. **Use environment variables** for key storage
2. **Never commit keys** to version control
3. **Rotate keys regularly**
4. **Use key-specific scopes** if available
5. **Monitor key usage** for anomalies
6. **Revoke unused keys**

### For Muse Integration

1. **Document authentication requirements** clearly
2. **Provide error messages** that guide users
3. **Handle token refresh** gracefully
4. **Implement retry logic** for transient errors
5. **Log authentication events** for monitoring
6. **Support both methods** for flexibility

## Testing Authentication

### Test OAuth Flow

```bash
# Test authorization endpoint
curl "https://rank.listeningkit.com/oauth/authorize?response_type=code&client_id=YOUR_CLIENT_ID&redirect_uri=https://example.com/callback&scope=read"

# Test token endpoint
curl -X POST "https://rank.listeningkit.com/oauth/token" \
  -d "grant_type=authorization_code" \
  -d "code=AUTHORIZATION_CODE" \
  -d "redirect_uri=https://example.com/callback" \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "client_secret=YOUR_CLIENT_SECRET"

# Test API access
curl "https://api.rank.listeningkit.com/v1/brand/brand_abc123" \
  -H "Authorization: Bearer ACCESS_TOKEN"
```

### Test API Key

```bash
# Test API key access
curl "https://api.rank.listeningkit.com/v1/brand/brand_abc123" \
  -H "X-API-Key: your-api-key-here"
```

## Troubleshooting

### Common OAuth Issues

**Issue: Authorization fails**
- Check client ID and secret are correct
- Verify redirect URI matches registered URI
- Ensure user has valid Rank account

**Issue: Token exchange fails**
- Verify authorization code is valid (not expired)
- Check redirect URI matches authorization request
- Ensure client secret is correct

**Issue: API requests return 401**
- Check access token is not expired
- Verify token has required scopes
- Ensure token is sent in correct header format

### Common API Key Issues

**Issue: API key rejected**
- Verify key is copied correctly
- Check key is not expired or revoked
- Ensure key is sent in correct header

**Issue: Rate limiting**
- Implement exponential backoff
- Check rate limit headers in response
- Consider upgrading to higher tier

## Documentation for Muse

When documenting authentication for Muse, include:

1. **Authentication Method**: OAuth 2.0 (recommended) or API Key
2. **OAuth Endpoints**: Authorization and token URLs
3. **Scopes**: Available scopes and their purposes
4. **API Key Usage**: Header format and key generation
5. **Error Handling**: Common errors and resolutions
6. **Security Considerations**: Best practices for secure authentication

Example documentation snippet:

```markdown
## Authentication

Rank supports OAuth 2.0 (recommended) and API key authentication.

### OAuth 2.0
- Authorization URL: https://rank.listeningkit.com/oauth/authorize
- Token URL: https://rank.listeningkit.com/oauth/token
- Scopes: `read` (read access), `write` (write access)

### API Key
- Header: `X-API-Key: your-api-key`
- Get keys from: https://rank.listeningkit.com/settings/api-keys
```

## Next Steps

1. **Choose authentication method** based on your security requirements
2. **Register OAuth client** if using OAuth 2.0
3. **Generate API key** if using API key authentication
4. **Test authentication** with provided examples
5. **Document authentication** in your connector specification
6. **Implement error handling** for authentication failures