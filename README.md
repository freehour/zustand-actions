# zustand-actions

Split a _zustand_ store into state and actions while keeping encapsulation.

```typescript
import { create } from 'zustand';
import { withActions } from 'zustand-actions';

interface CounterState {
    count: number;
}

const useCounter = create(
    withActions(
        draft => ({
            increment: () => {
                draft.count++;
            },
            decrement: () => {
                draft.count--;
            },
        }),
        (): CounterState => ({
            count: 0,
        }),
    ),
);

// call actions directly on the store
useCounter.actions.increment();
useCounter.actions.decrement();

// batch actions together with `updateState`
useCounter.updateState(({increment, decrement}, draft) => {
    draft.count = 0;
    for (let i = 0; i < 10; i++) {
        increment();
    }
    for (let i = 0; i < 5; i++) {
        decrement();
    }
}

```

## Installation

### npm

```bash
npm install zustand-actions
```

### bun

```bash
bun install zustand-actions
```

## Motivation

A common pattern in _zustand_ is to split the store into state and actions.

A simple way to achieve this is to define actions at module level, see: [Practice with no store actions](https://docs.pmnd.rs/zustand/guides/practice-with-no-store-actions)

Or if you prefer to colocate your actions with the state, define them under a separate key and provide a custom hook to access them.

```typescript
import { type StateCreator, create } from 'zustand';

interface Counter {
    count: number;
    actions: {
        increment: () => void;
        decrement: () => void;
    };
}

const useCounter = create<Counter>()(set => ({
    count: 0,
    actions: {
        increment: () => set(state => ({ count: state.count + 1 })),
        decrement: () => set(state => ({ count: state.count - 1 })),
    },
}));

const useCounterActions = useCounter(state => state.actions);

// this is fine (assuming the 'actions' don't change), no selector needed
const { increment } = useCounterActions;
```

This has some drawbacks:

-   You need to write a separate hook for your actions
-   Actions are still part of the state, so they can be changed via `setState`.

## Middlewares to the rescue

_zustand-actions_ provides a middleware `withActions` to split the store into `State` and `Actions`.
The `setState` and `getState` functions are restricted to the `State` type.

Additionally, the `StoreApi` provides a property `actions` function to access the actions directly, no custom hook needed.
To batch actions together, you can use the `updateState` function receiving the actions and draft as input.

## Actions

Actions are defined as functions of an immer `Draft<State>` that can be used to mutate the state directly without manually merging the state.
