# Integrations

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

Convex integrates with a variety of supported third party tools for log streaming and exception reporting.

* [Log Streams](/production/integrations/log-streams/.md) enable streaming of log events from your Convex deployment to supported destinations, such as Axiom, Datadog, PostHog, or a custom webhook.
* [Exception Reporting](/production/integrations/exception-reporting.md) gives visibility into errors in your Convex function executions.

## Configuring an Integration[​](#configuring-an-integration "Direct link to Configuring an Integration")

To configure an integration, navigate to the [Deployment Settings](https://dashboard.convex.dev/deployment/settings) in the Dashboard, and the "Integrations" tab in the sidebar. This page provides a list of your configured integrations, their current health status, and other integrations available to be configured. To configure a integration, click on the card and follow the setup directions.

![Integrations page](/screenshots/storybook/pages_project_deployment_settings_integrations_light.webp)

## Deleting an Integration[​](#deleting-an-integration "Direct link to Deleting an Integration")

To remove an integration and stop further events from being piped out to the configured destination, select the menu icon in the upper-right corner of a configured panel and select "Delete integration". After confirming, the integration will stop running within a few seconds.

## Feedback[​](#feedback "Direct link to Feedback")

Please reach out with any questions, comments, or suggestions [on Discord](https://convex.dev/community).

## Integration Components[​](#integration-components "Direct link to Integration Components")

Beyond integrations for logs and exceptions, [Convex Components](/components/overview.md) make it easier to work with third party services. See the full list of components on the [Convex Components Directory](https://convex.dev/components).

[Convex Component](https://www.convex.dev/components/cloudflare-r2)

### [Cloudflare R2](https://www.convex.dev/components/cloudflare-r2)

[Store and serve files in Cloudflare's R2 storage.](https://www.convex.dev/components/cloudflare-r2)

[Convex Component](https://www.convex.dev/components/prosemirror-sync)

### [Collaborative Text Editor](https://www.convex.dev/components/prosemirror-sync)

[Real-time collaborative text editing using BlockNote or Tiptap.](https://www.convex.dev/components/prosemirror-sync)

[Convex Component](https://www.convex.dev/components/push-notifications)

### [Expo Push Notifications](https://www.convex.dev/components/push-notifications)

[Send mobile push notifications using Expo.](https://www.convex.dev/components/push-notifications)

[Convex Component](https://www.convex.dev/components/twilio)

### [Twilio SMS](https://www.convex.dev/components/twilio)

[Send and receive SMS messages using Twilio's API.](https://www.convex.dev/components/twilio)

[Convex Component](https://www.convex.dev/components/launchdarkly)

### [LaunchDarkly Feature Flags](https://www.convex.dev/components/launchdarkly)

[Sync feature flags with backend, backed by LaunchDarkly.](https://www.convex.dev/components/launchdarkly)

[Convex Component](https://www.convex.dev/components/polar)

### [Polar](https://www.convex.dev/components/polar)

[Add subscriptions and billing with Polar.](https://www.convex.dev/components/polar)
