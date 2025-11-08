import type { Draft, Immutable } from 'immer';
import { produce } from 'immer';
import type { ExtractState, Mutate, StateCreator, StoreApi, StoreMutatorIdentifier } from 'zustand';


export type Action = (...args: any[]) => void;
export type Actions = Record<string, Action>;

type UpdateStateWithActions<T, A> = (updater: (actions: A, draft: Draft<T>) => void) => void;

interface WithActions<T, A> {
    /**
     * Updates the state using actions.
     * @param updater A function that receives the actions and draft and updates the state.
     */
    readonly updateState: UpdateStateWithActions<T, A>;
    readonly actions: Immutable<A>;
}

declare module 'zustand/vanilla' {
    interface StoreMutators<S, A> {
        ['zustand-actions']: S & WithActions<ExtractState<S>, A>;
    }
}

type Middleware = <
    T,
    A extends Actions = Actions,
    Mps extends [StoreMutatorIdentifier, unknown][] = [],
    Mcs extends [StoreMutatorIdentifier, unknown][] = [],
>(
    actions: (draft: Draft<T>) => A,
    f: StateCreator<T, [...Mps, ['zustand-actions', A]], Mcs>,
) => StateCreator<T, Mps, [['zustand-actions', A], ...Mcs]>;

type MiddlewareImpl = <
    T,
    A extends Actions = Actions,
>(
    actions: (draft: Draft<T>) => A,
    f: StateCreator<T, [['zustand-actions', A]]>,
) => StateCreator<T, [], [['zustand-actions', A]]>;


function mutateWithActions<
    T,
    A extends Actions = Actions,
>(
    api: StoreApi<T>,
    actions: (draft: Draft<T>) => A,
): Mutate<StoreApi<T>, [['zustand-actions', A]]> {

    const updateState: UpdateStateWithActions<T, A> = updater => {
        api.setState(
            produce<T>(
                draft => updater(
                    actions(draft),
                    draft,
                ),
            ),
        );
    };

    const actionKeys = Object.keys(actions({} as Draft<T>)) as (keyof A)[];
    const actionsMap = Object.fromEntries(
        actionKeys.map(key => [
            key,
            (...args: any[]) => updateState(actions => actions[key](...args)),
        ]),
    );

    return Object.defineProperties(api, {
        updateState: {
            value: updateState,
            enumerable: false,
            writable: false,
            configurable: false,
        },
        actions: {
            value: actionsMap,
            enumerable: false,
            writable: false,
            configurable: false,
        },
    }) as unknown as Mutate<StoreApi<T>, [['zustand-actions', A]]>;
}

const withActionsImpl: MiddlewareImpl = (actions, f) => (set, get, api) => {
    const withActions = mutateWithActions(api, actions);
    return f(withActions.setState, withActions.getState, withActions);
};

export const withActions: Middleware = withActionsImpl as Middleware;
export type WithActionsMiddleware<A extends Actions = Actions> = ['zustand-actions', A];
