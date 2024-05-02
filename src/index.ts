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

    const store: Mutate<StoreApi<T>, [['zustand-actions', never]]> = {
        setState: nextState =>
            api.setState((nextState instanceof Function ? nextState(api.getState()) : nextState) as Partial<T>),
        getState: () => api.getState(),
        getInitialState: () => api.getInitialState(),
        subscribe: listener => api.subscribe((state, prevState) => listener(state, prevState)),
        getActions: () => api.getState(),
        destroy: () => api.destroy(),
    };
    return f(store.setState, store.getState, store);
};

export const withActions = withActionsImpl as Middleware;
