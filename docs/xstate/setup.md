# Setup

The project uses the XState v6 `setup()` factory with type-only `types<T>()` schemas. Transitions are inline functions that return shallow context patches.

```ts
import { setup, types } from "xstate";

type CounterContext = { count: number };
type CounterInput = { initialCount: number };

const counterSetup = setup({
  schemas: {
    context: types<CounterContext>(),
    input: types<CounterInput>(),
    events: {
      increment: types<{ amount: number }>(),
    },
  },
});

const counterMachine = counterSetup.createMachine({
  context: ({ input }) => ({ count: input.initialCount }),
  initial: "active",
  states: {
    active: {
      on: {
        increment: ({ context, event }) => ({
          context: { count: context.count + event.amount },
        }),
      },
    },
  },
});
```

Machine context and event payloads must remain serializable when the actor is used by a Convex action. Use `machine.provide(...)` for test or deployment-specific implementations; do not add provider I/O to a transition function.
