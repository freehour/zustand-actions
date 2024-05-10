/* eslint-disable @typescript-eslint/no-unused-vars */
import { create } from 'zustand';
import type { ActionKeys, Actions, State } from 'zustand-actions';
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

type NestedActionKeys = ActionKeys<Nested>; // 'increment'
type NestedState = State<Nested>; // { parent: { child: { count: number } } }
type NestedActions = Actions<Nested>; // { increment: () => void }

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

// produce State<Nested> only
useNested.setState(draft => {
    draft.parent.child.count = 1;
});
