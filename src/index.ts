import type { Mutate, StateCreator, StoreApi, StoreMutatorIdentifier } from 'zustand/vanilla';

declare module 'zustand/vanilla' {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface StoreMutators<S, A> {
        ['zustand-actions']: WithActions<S>;
    }
}

export type ActionKeys<S> = {
    [K in keyof S]: S[K] extends (...args: any[]) => any ? K : never;
}[keyof S];

export type Actions<S> = Pick<S, ActionKeys<S>>;
export type State<S> = Omit<S, ActionKeys<S>>;

type WithActions<S> = S extends {
    getState: () => infer T;
}
    ? StoreApi<State<T>> & {
          getActions: () => Actions<T>;
      }
    : never;

type Middleware = <
    T,
    Mps extends [StoreMutatorIdentifier, unknown][] = [],
    Mcs extends [StoreMutatorIdentifier, unknown][] = [],
>(
    f: StateCreator<T, [...Mps, ['zustand-actions', never]], Mcs>,
) => StateCreator<T, Mps, [['zustand-actions', never], ...Mcs]>;

type MiddlewareImpl = <T>(
    f: StateCreator<T, [['zustand-actions', never]]>,
) => StateCreator<T, [], [['zustand-actions', never]]>;

const withActionsImpl: MiddlewareImpl = f => (set, get, api) => {
    type T = ReturnType<typeof f>;

    // add getActions to api
    Object.defineProperty(api, 'getActions', {
        value: function () {
            return this.getState();
        },
        enumerable: true,
    });

    return f(api.setState, api.getState, api as unknown as Mutate<StoreApi<T>, [['zustand-actions', never]]>);
};

export const withActions = withActionsImpl as Middleware;
