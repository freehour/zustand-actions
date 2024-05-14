/* eslint-disable @typescript-eslint/no-unused-vars */
import type { StateCreator } from 'zustand';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { ActionKeys, Actions, State } from 'zustand-actions';
import { withActions } from 'zustand-actions';


export interface Nested {
    parent: {
        child: {
            count: number;
        };
    };
    increment: () => void;
}

type NestedActionKeys = ActionKeys<Nested>; // 'increment'
type NestedState = State<Nested>; // { parent: { child: { count: number } } }
type NestedActions = Actions<Nested>; // { increment: () => void }

const createNested: StateCreator<Nested, [['zustand-actions', ActionKeys<Nested>], ['zustand/immer', never]]> = (set, get, api) => ({
    parent: {
        child: {
            count: 0,
        },
    },
    increment: () => set(draft => void draft.parent.child.count++),
});

export const useNested = create<Nested>()(
    withActions(
        immer(createNested),
    ),
);

// produce State<Nested> only
useNested.setState(draft => {
    draft.parent.child.count = 1;
});
