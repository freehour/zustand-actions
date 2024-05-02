# zustand-actions

Split a _zustand_ store into state and actions while keeping encapsulation.

```typescript
import { create } from 'zustand';
import { withActions } from 'zustand-actions';

export interface Counter {
    //--- State<Counter> ---
    count: number;

    //--- Actions<Counter> ---
    increment: () => void;
    decrement: () => void;
}

export const useCounter = create<Counter>()(
    withActions(set => ({
        count: 0,
        increment: () => set(state => ({ count: state.count + 1 })),
        decrement: () => set(state => ({ count: state.count - 1 })),
    })),
);

const { increment } = useCounter.getActions(); // Actions<Counter>
const { count } = useCounter.getState(); // State<Counter>

// setState and selectors are restricted to State<Counter>
useCounter(state => state.count);
useCounter.setState({ count: 1 });
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

A simple way to achieve this is to define actions at the module level, see: [Practice with no store actions](https://docs.pmnd.rs/zustand/guides/practice-with-no-store-actions)

Or if you prefer to colocate your actions with the state, define them under a separate key and provide a custom hook to access them.

```typescript
import { type StateCreator, create } from 'zustand';

export interface Counter {
    count: number;
    actions: {
        increment: () => void;
        decrement: () => void;
    };
}

export const useCounter = create<Counter>()(set => ({
    count: 0,
    actions: {
        increment: () => set(state => ({ count: state.count + 1 })),
        decrement: () => set(state => ({ count: state.count - 1 })),
    },
}));

export const useCounterActions = useCounter(state => state.actions);

// this is fine (assuming the 'actions' don't change), no selector needed
const { increment } = useCounterActions;
```

However, this does have some drawbacks:

-   You need to write a separate hook for your actions
-   Actions are still part of the state, so they can be changed via `setState`.

## Middlewares to the rescue

_zustand-actions_ provides a middleware `withActions` to split the store into `State` and `Actions`.
The `setState` and `getState` functions are restricted to the `State` type.
Additionally, the `StoreApi` provides a `getActions` function to access the actions, no custom hook needed.

## Usage with other middlewares

_zustand-actions_ can be used with other middlewares, such as `immer`.
Just make sure to apply `withActions` last.

```typescript
import { create } from 'zustand';
import { withActions } from 'zustand-actions';
import { immer } from 'zustand/middleware/immer';

export interface Nested {
    parent: {
        child: {
            count: number;
        };
    };
    increment: () => void;
}

export const useNested = create<Nested>()(
    withActions(
        immer(set => ({
            parent: {
                child: {
                    count: 0,
                },
            },
            increment: () => set(draft => void draft.parent.child.count++),
        })),
    ),
);

// setState and draft are restricted to State<Nested>
useNested.setState(draft => {
    draft.parent.child.count = 1;
});
```
