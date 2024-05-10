import type { Mutate, StateCreator, StoreApi, StoreMutatorIdentifier } from 'zustand/vanilla';

type ExtractState<S> = S extends {
    getState: () => infer T;
}
    ? T
    : never;

declare module 'zustand/vanilla' {
    interface StoreMutators<S, A extends keyof ExtractState<S>> {
        ['zustand-actions']: WithActions<ExtractState<S>, A>;
    }
}

export type ActionKeys<T> = {
    [K in keyof T]: T[K] extends (...args: any[]) => any ? K : never;
}[keyof T];

export type StateKeys<T> = {
    [K in keyof T]: T[K] extends (...args: any[]) => any ? never : K;
}[keyof T];

export type Actions<T, K extends keyof T = ActionKeys<T>> = Pick<T, K>;
export type State<T, K extends keyof T = StateKeys<T>> = Pick<T, K>;

type WithActions<T, A extends keyof T = ActionKeys<T>> = StoreApi<Omit<T, A>> & {
    getActions: () => Actions<T, A>;
};

type Middleware = <
    T,
    A extends keyof T = ActionKeys<T>,
    Mps extends [StoreMutatorIdentifier, unknown][] = [],
    Mcs extends [StoreMutatorIdentifier, unknown][] = [],
>(
    f: StateCreator<T, [...Mps, ['zustand-actions', never]], Mcs>,
) => StateCreator<T, Mps, [['zustand-actions', A], ...Mcs]>;

type MiddlewareImpl = <T>(
    f: StateCreator<T, [['zustand-actions', ActionKeys<T>]]>,
) => StateCreator<T, [], [['zustand-actions', ActionKeys<T>]]>;

const withActionsImpl: MiddlewareImpl = f => (set, get, api) => {
    type T = ReturnType<typeof f>;

    Object.defineProperty(api, 'getActions', {
        value: function () {
            return this.getState();
        },
        enumerable: true,
    });

    return f(api.setState, api.getState, api as unknown as Mutate<StoreApi<T>, [['zustand-actions', ActionKeys<T>]]>);
};

export const withActions = withActionsImpl as Middleware;
