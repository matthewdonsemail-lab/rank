# Testing

Machine tests assert observable behavior: create an actor, send an event, and inspect the resulting snapshot and context.

```ts
const actor = createActor(machine, { input }).start();
actor.send({ type: "START", at: 1_001 });
expect(actor.getSnapshot().value).toBe("evaluating");
```

Each machine test covers its successful path, failure path, retry path, cancellation, and JSON persistence round trip. Provider calls belong in Convex action boundaries and are replaced with fakes or mocked responses; unit tests do not make real Firecrawl, Treg, or TypeSafe requests.

Use `node scripts/check-machine-docs.mjs` to verify that every machine has a test, manifest entry, inventory row, and generated diagram node.
