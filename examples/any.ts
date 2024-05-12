/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-unused-vars */
import type { StateCreator } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { ActionKeys, Actions, State } from 'zustand-actions';
import { withActions } from 'zustand-actions';


export interface Any {
    name: string;
    value: any;
    setValue: (value: any) => void;
}

// actionkeys, actions and state can only be fully inferred if type is known
type AnyActionKeys = ActionKeys<Any>;
type AnyActions = Actions<Any>;
type AnyState = State<Any>;

export function createAny(
    name: string,
    initialValue: any,
): StateCreator<Any, [], [['zustand-actions', never], ['zustand/immer', never]]> {
    return withActions(
        immer(set => ({
            name,
            value: initialValue,
            setValue: value => set({ value }),
        })),
    );
}
