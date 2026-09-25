# Persistence

XState v6 persists a serializable snapshot through `getPersistedSnapshot()` and restores it through the `snapshot` option on `createActor()`.

```ts
const actor = createActor(machine, { input }).start();
const persisted = JSON.parse(JSON.stringify(actor.getPersistedSnapshot()));
const restored = createActor(machine, { input, snapshot: persisted }).start();
```

Every project machine has a stable `id` and `version`. The machine manifest records those values, and tests assert the versioned JSON round trip.

The Convex records store the current state and serializable workflow context separately so a later action can reconstruct an actor. They do not store a live actor, provider client, socket, promise, or API key.

XState v5 persisted snapshots are not binary-compatible with v6 snapshots. A future state/context/child-actor change requires an explicit migration or a deliberate reset of affected records.
