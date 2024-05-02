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

// produce State<Nested> only
useNested.setState(draft => {
    draft.parent.child.count = 1;
});
