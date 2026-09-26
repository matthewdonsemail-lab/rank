import fs from 'node:fs';
import path from 'node:path';

const TELNYX_BASE = 'https://developers.telnyx.com';
const TARGET_DIR = path.resolve('docs/telnyx');

const DOC_PAGES = [
  { url: `${TELNYX_BASE}/llms.txt`, path: 'llms.txt' },
  { url: `${TELNYX_BASE}/public/llms/messaging.txt`, path: 'messaging.txt' },
  { url: `${TELNYX_BASE}/public/llms/messaging-full.txt`, path: 'messaging-full.txt' },
  { url: `${TELNYX_BASE}/docs/development/api-fundamentals/authentication.md`, path: 'development/api-fundamentals/authentication.md' },
  { url: `${TELNYX_BASE}/docs/development/api-fundamentals/api-errors.md`, path: 'development/api-fundamentals/api-errors.md' },
  { url: `${TELNYX_BASE}/docs/development/api-fundamentals/webhooks/receiving-webhooks.md`, path: 'development/api-fundamentals/webhooks/receiving-webhooks.md' },
  { url: `${TELNYX_BASE}/docs/messaging/messages/send-message.md`, path: 'messaging/messages/send-message.md' },
  { url: `${TELNYX_BASE}/docs/messaging/messages/receiving-webhooks.md`, path: 'messaging/messages/receiving-webhooks.md' },
  { url: `${TELNYX_BASE}/docs/messaging/messages/receive-message.md`, path: 'messaging/messages/receive-message.md' },
  { url: `${TELNYX_BASE}/docs/messaging/messages/phone-number-configuration.md`, path: 'messaging/messages/phone-number-configuration.md' },
  { url: `${TELNYX_BASE}/docs/messaging/messages/messaging-profiles-overview.md`, path: 'messaging/messages/messaging-profiles-overview.md' },
  { url: `${TELNYX_BASE}/docs/messaging/messages/number-pool.md`, path: 'messaging/messages/number-pool.md' },
  { url: `${TELNYX_BASE}/docs/messaging/messages/error-codes.md`, path: 'messaging/messages/error-codes.md' },
  { url: `${TELNYX_BASE}/docs/messaging/10dlc/quickstart.md`, path: 'messaging/10dlc/quickstart.md' },
];

async function fetchWithRetry(url, retries = 3, delay = 500) {
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      const response = await fetch(url, { headers: { 'User-Agent': 'Node-Doc-Fetcher' } });
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      return await response.text();
    } catch (error) {
      if (attempt === retries) throw error;
      await new Promise((resolve) => setTimeout(resolve, delay * attempt));
    }
  }
}

const README = `# Telnyx Documentation Index

Local offline mirror of the Telnyx documentation used by Rank.

## Primary References

- [Telnyx documentation index](./llms.txt): Official documentation map.
- [Messaging index](./messaging.txt): Messaging-focused documentation map.
- [Full messaging content](./messaging-full.txt): Complete messaging documentation stream.

## Messaging

- [Send a message](./messaging/messages/send-message.md): SMS/MMS API, sender setup, E.164, and error handling.
- [Receive messages](./messaging/messages/receive-message.md): Inbound message handling.
- [Messaging webhooks](./messaging/messages/receiving-webhooks.md): Event payloads, Ed25519 verification, retries, and idempotency.
- [Phone number configuration](./messaging/messages/phone-number-configuration.md): Number/profile assignment and health.
- [Messaging profiles](./messaging/messages/messaging-profiles-overview.md): Profile configuration and webhook URLs.
- [Number pool](./messaging/messages/number-pool.md): Sender selection.
- [Messaging error codes](./messaging/messages/error-codes.md): Delivery and API failures.

## Fundamentals

- [API authentication](./development/api-fundamentals/authentication.md): Bearer API keys and server-side credentials.
- [API errors](./development/api-fundamentals/api-errors.md): Error envelope and retry semantics.
- [Webhook fundamentals](./development/api-fundamentals/webhooks/receiving-webhooks.md): Signature and delivery guarantees.
- [10DLC registration](./messaging/10dlc/quickstart.md): US A2P registration requirements.
`;

async function main() {
  fs.mkdirSync(TARGET_DIR, { recursive: true });
  let completed = 0;
  let failed = 0;

  for (const item of DOC_PAGES) {
    try {
      console.log(`Fetching ${item.url}...`);
      const text = await fetchWithRetry(item.url);
      const outputPath = path.join(TARGET_DIR, item.path);
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });
      fs.writeFileSync(outputPath, text, 'utf8');
      completed += 1;
      console.log(`Saved ${item.path} (${text.length} bytes)`);
    } catch (error) {
      failed += 1;
      console.warn(`Failed ${item.url}: ${error.message}`);
    }
  }

  fs.writeFileSync(path.join(TARGET_DIR, 'README.md'), README, 'utf8');
  console.log(`Generated docs/telnyx/README.md`);
  console.log(`Completed: ${completed} succeeded, ${failed} failed.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
