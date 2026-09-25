# Actors

An actor is one running instance of a machine or other XState logic. The project creates a short-lived actor for each Convex action step.

```ts
import { createActor } from "xstate";

const actor = createActor(machine, { input });
actor.start();
actor.send({ type: "START" });
const snapshot = actor.getSnapshot();
const persisted = actor.getPersistedSnapshot();
actor.stop();
```

`createActor()` is the v6 actor API. The project does not use the removed `interpret()` alias. Events are sent through `actor.send(...)`; typed `actor.trigger.*` methods are available when a machine declares event schemas.

A Convex action restores the actor, performs the external operation, sends the typed result event, persists the resulting state/context, and lets the actor stop. No workflow correctness depends on an actor surviving a request boundary.
