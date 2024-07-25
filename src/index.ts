import type { Mutate } from 'zustand';
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


export function mutateWithActions<
    T,
    A extends keyof T = ActionKeys<T>,
    Mis extends [StoreMutatorIdentifier, unknown][] = [],
>(
    api: Mutate<StoreApi<T>, Mis>,
): Mutate<StoreApi<T>, [...Mis, ['zustand-actions', A]]> {
    return Object.defineProperty(api, 'getActions', {
        value: function() {
            return api.getState();
        },
        enumerable: true,
    }) as unknown as Mutate<StoreApi<T>, [...Mis, ['zustand-actions', A]]>;
}

const withActionsImpl: MiddlewareImpl = f => (set, get, api) => {
    mutateWithActions(api);
    return f(api.setState, api.getState, api);
};

export const withActions = withActionsImpl as Middleware;

export type WithActionsMiddleware<State, Actions = ActionKeys<State>> = ['zustand-actions', Actions];
