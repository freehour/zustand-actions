import type { StateCreator, StoreApi, StoreMutatorIdentifier } from 'zustand/vanilla';


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
    f: StateCreator<T, [...Mps, ['zustand-actions', A]], Mcs>,
) => StateCreator<T, Mps, [['zustand-actions', A], ...Mcs]>;

type MiddlewareImpl = <T>(
    f: StateCreator<T>,
) => StateCreator<T>;

const withActionsImpl: MiddlewareImpl = f => (set, get, api) => {
    Object.defineProperty(api, 'getActions', {
        value: function() {
            return this.getState();
        },
        enumerable: true,
    });

    return f(api.setState, api.getState, api);
};

export const withActions = withActionsImpl as Middleware;
