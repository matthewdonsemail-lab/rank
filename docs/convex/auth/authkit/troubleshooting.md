# AuthKit Troubleshooting

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

## Debugging authentication[​](#debugging-authentication "Direct link to Debugging authentication")

If a user goes through the WorkOS AuthKit login flow successfully, and after being redirected back to your page, `useConvexAuth()` returns `isAuthenticated: false`, it's possible that your backend isn't correctly configured.

The `convex/auth.config.ts` file contains a list of configured authentication providers. You must run `npx convex dev` or `npx convex deploy` after adding a new provider to sync the configuration to your backend.

Common issues with WorkOS AuthKit integration:

1. **Incorrect Client ID**: Ensure the `WORKOS_CLIENT_ID` in your Convex environment matches your WorkOS application
2. **Missing Environment Variables**: Verify all required WorkOS environment variables are set in both your local environment and Convex dashboard
3. **Redirect URI Mismatch**: Ensure the `NEXT_PUBLIC_WORKOS_REDIRECT_URI` matches what's configured in your WorkOS Dashboard
4. **Missing `aud` claim**: WorkOS JWTs may not include the `aud` (audience) claim by default, which Convex requires for token validation. Check your WorkOS Dashboard JWT configuration to ensure the audience claim is properly set to your Client ID

For more thorough debugging steps, see the WorkOS AuthKit documentation or [Debugging Authentication](/auth/debug.md).

## Platform not authorized[​](#platform-not-authorized "Direct link to Platform not authorized")

```
WorkOSPlatformNotAuthorized: Your WorkOS platform API key is not authorized to

access this team. Please ensure the API key has the correct permissions in the

WorkOS dashboard.
```

This error occurs when your WorkOS platform API key is not authorized to access the WorkOS team associated with your Convex team.

This typically happens when the WorkOS workspace has had Convex removed.

You can contact WorkOS support to ask to restore this permission, or unlink the current workspace and create a new one:

```
npx convex integration workos disconnect-team

npx convex integration workos provision-team
```

You'll need to use a different email address to create your new WorkOS Workspace as an email address can only be associated with a single WorkOS workspace.
