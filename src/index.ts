import type { Mutate, StateCreator, StoreApi, StoreMutatorIdentifier } from 'zustand/vanilla';

declare module 'zustand/vanilla' {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface StoreMutators<S, A> {
        withActions: StoreWithActions<S>;
    }
}

export type ActionKeys<S> = {
    [K in keyof S]: S[K] extends (...args: any[]) => any ? K : never;
}[keyof S];

export type Actions<S> = Pick<S, ActionKeys<S>>;
export type State<S> = Omit<S, ActionKeys<S>>;

type StoreWithActions<S> = S extends {
    getState: () => infer T;
}
    ? StoreApi<State<T>> & {
          getActions: () => Actions<T>;
      }
    : never;

type WithActions = <
    T,
    Mps extends [StoreMutatorIdentifier, unknown][] = [],
    Mcs extends [StoreMutatorIdentifier, unknown][] = [],
>(
    f: StateCreator<T, [...Mps, ['withActions', unknown]], Mcs>,
) => StateCreator<T, Mps, [['withActions', unknown], ...Mcs]>;

type WithActionsImpl = <T>(
    f: StateCreator<T, [['withActions', unknown]]>,
) => StateCreator<T, [], [['withActions', unknown]]>;

const withActionsImpl: WithActionsImpl = f => (set, get, api) => {
    type T = ReturnType<typeof f>;

    const store: Mutate<StoreApi<T>, [['withActions', unknown]]> = {
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

export const withActions: WithActions = withActionsImpl as WithActions;
